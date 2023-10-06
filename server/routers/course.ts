import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import { MAX_FILE_SIZE } from "@/lib/course";
import { s3Client } from "@/lib/s3";
import {
	CourseSchema,
	DeleteCourseSchema,
	SelectCourseSchema,
	UpdateCourseSchema,
	UploadCourseSchema,
} from "@/types/course";
import { LearnerSchema } from "@/types/learner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCourse } from "../helpers";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

// https://www.restapitutorial.com/lessons/httpmethods.html

export const courseRouter = router({
	upload: protectedProcedure
		.input(UploadCourseSchema)
		.mutation(async ({ ctx: { teamId }, input: { name, version } }) => {
			const insertId = crypto.randomUUID();

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

			await db.insert(courses).values({
				id: insertId,
				teamId,
				name,
				version,
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
			return await getCourse({ id, teamId, learners: true });
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
		.output(z.undefined())
		.mutation(async ({ ctx: { teamId }, input: { id } }) => {
			await getCourse({ id, teamId });

			await db.transaction(async (tx) => {
				await tx
					.delete(courses)
					.where(and(eq(courses.id, id), eq(courses.teamId, teamId)));
				await tx.delete(learners).where(eq(learners.courseId, id));
			});

			return undefined;
		}),
	update: protectedProcedure
		.input(UpdateCourseSchema)
		.output(CourseSchema)
		.meta({
			openapi: {
				summary: "Update a course",
				method: "PUT",
				path: "/courses/{id}",
				protect: true,
			},
		})
		.mutation(async ({ ctx: { teamId }, input: { id, ...rest } }) => {
			const course = await getCourse({ id, teamId });

			await db
				.update(courses)
				.set({ ...rest })
				.where(
					and(eq(courses.id, course.id), eq(courses.teamId, teamId))
				);

			return {
				...course,
				...rest,
			};
		}),
});
