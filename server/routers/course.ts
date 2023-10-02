import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import { MAX_FILE_SIZE } from "@/lib/course";
import { s3Client } from "@/lib/s3";
import {
	CourseSchema,
	DeleteCourseSchema,
	SelectCourseSchema,
	UploadCourseSchema,
} from "@/types/course";
import { LearnerSchema } from "@/types/learner";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const courseRouter = router({
	upload: protectedProcedure
		.input(UploadCourseSchema)
		.mutation(async ({ ctx: { teamId }, input: { name, version } }) => {
			const insertId = crypto.randomUUID();

			// Insert course into database if successfully uploaded to S3
			await db.insert(courses).values({
				id: insertId,
				teamId,
				name,
				version,
			});

			// Create a presigned post to upload the course to S3
			const presignedUrl = await createPresignedPost(s3Client as any, {
				Bucket: "krak-lms",
				Key: `courses/${insertId}`,
				Fields: {
					key: `courses/${insertId}`,
				},
				Conditions: [
					["eq", "$Content-Type", "application/zip"],
					["content-length-range", 0, MAX_FILE_SIZE],
				],
			});

			return {
				presignedUrl,
				courseId: insertId,
			};
		}),
	findOne: protectedProcedure
		.meta({
			openapi: {
				summary: "Get a course by ID",
				method: "GET",
				path: "/courses/{id}",
				protect: true,
			},
		})
		.input(SelectCourseSchema)
		.output(CourseSchema.extend({ learners: LearnerSchema.array() }))
		.query(async ({ ctx: { teamId }, input: { id } }) => {
			const course = await db.query.courses.findFirst({
				where: and(eq(courses.teamId, teamId), eq(courses.id, id)),
				with: {
					learners: true,
				},
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Course not found or does not belong to you",
				});
			} else {
				return course;
			}
		}),
	find: protectedProcedure
		.meta({
			openapi: {
				summary: "Get all courses",
				method: "GET",
				path: "/courses",
				protect: true,
			},
		})
		.input(z.undefined())
		.output(CourseSchema.array())
		.query(async ({ ctx: { teamId } }) => {
			return await db.query.courses.findMany({
				where: eq(courses.teamId, teamId),
			});
		}),
	delete: protectedProcedure
		.meta({
			openapi: {
				summary: "Delete a course",
				method: "DELETE",
				path: "/courses/{id}",
				protect: true,
			},
		})
		.input(DeleteCourseSchema)
		.output(CourseSchema)
		.mutation(async ({ ctx: { teamId }, input: { id } }) => {
			const course = await db.query.courses.findFirst({
				where: and(eq(courses.teamId, teamId), eq(courses.id, id)),
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message:
						"Course does not exist or does not belong to current team",
				});
			}

			// Delete the course from S3
			await s3Client.send(
				new DeleteObjectCommand({
					Bucket: "krak-lms",
					Key: `courses/${id}`,
				})
			);

			// delete the course if it exists and the user owns it and is currently on the team
			await db
				.delete(courses)
				.where(
					and(eq(courses.id, course.id), eq(courses.teamId, teamId))
				);
			// Delete the course users
			await db.delete(learners).where(eq(learners.courseId, course.id));

			return course;
		}),
});
