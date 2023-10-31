import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import { env } from "@/env.mjs";
import {
	CourseSchema,
	DeleteCourseSchema,
	SelectCourseSchema,
	UpdateCourseSchema,
	UploadCourseSchema,
} from "@/types/course";
import { LearnerSchema } from "@/types/learner";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCourse } from "../helpers";
import { protectedProcedure } from "../procedures";
import { svix } from "../svix";
import { router } from "../trpc";

// https://www.restapitutorial.com/lessons/httpmethods.html

export const courseRouter = router({
	upload: protectedProcedure
		.input(UploadCourseSchema)
		.mutation(async ({ ctx: { teamId }, input: { name, version, id } }) => {
			if (id === "") {
				id = undefined;
			}

			if (id) {
				const course = await db.query.courses.findFirst({
					where: and(eq(courses.id, id)),
				});
				if (course) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Course already exists with that identifier",
					});
				}
			}

			const insertId = id ?? crypto.randomUUID();

			const presignedUrlRes = await fetch(
				`${env.NEXT_PUBLIC_SITE_URL}/content/${insertId}`,
				{
					method: "POST",
				}
			);
			const presignedUrl =
				(await presignedUrlRes.json()) as PresignedPost;

			console.log(presignedUrl);

			await db.insert(courses).values({
				id: insertId,
				teamId,
				name,
				version,
			});

			await svix.application.create({
				name: `app_${insertId}`,
				uid: `app_${insertId}`,
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
		.input(DeleteCourseSchema)
		.output(z.undefined())
		.mutation(async ({ ctx: { teamId }, input: { id } }) => {
			await getCourse({ id, teamId });

			await db.transaction(async (tx) => {
				await tx
					.delete(courses)
					.where(and(eq(courses.id, id), eq(courses.teamId, teamId)));
				await tx.delete(learners).where(eq(learners.courseId, id));
				const res = await fetch(
					`${env.NEXT_PUBLIC_SITE_URL}/content/${id}`,
					{
						method: "DELETE",
						headers: {
							AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
						},
					}
				);
				if (!res.ok) {
					throw new Error("Failed to delete course");
				}
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
