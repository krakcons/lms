import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import { s3Client } from "@/lib/s3";
import { DeleteCourseSchema, SelectCourseSchema } from "@/types/course";
import { DeleteObjectsCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const courseRouter = router({
	findOne: protectedProcedure
		.input(SelectCourseSchema)
		.query(async ({ ctx: { teamId }, input: id }) => {
			const course = await db.query.courses.findFirst({
				where: and(eq(courses.teamId, teamId), eq(courses.id, id)),
				with: {
					learners: true,
				},
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message:
						"Course does not exist or does not belong to current team",
				});
			} else {
				return course;
			}
		}),
	find: protectedProcedure.query(async ({ ctx: { teamId } }) => {
		return await db.query.courses.findMany({
			where: eq(courses.teamId, teamId),
		});
	}),
	delete: protectedProcedure
		.input(DeleteCourseSchema)
		.mutation(async ({ ctx: { teamId }, input: id }) => {
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

			// get all files in the course
			const courseFiles = await s3Client.send(
				new ListObjectsCommand({
					Bucket: "krak-lms",
					Prefix: `courses/${course.id}/`,
				})
			);

			// delete the files
			if (courseFiles.Contents) {
				const deleted = await s3Client.send(
					new DeleteObjectsCommand({
						Bucket: "krak-lms",
						Delete: {
							Objects: courseFiles.Contents.map((item) => ({
								Key: item.Key,
							})), // array of keys to be deleted
						},
					})
				);
				console.log("Deleted", deleted.Deleted?.length);
			} else {
				console.log("No files found");
			}

			// delete the course if it exists and the user owns it and is currently on the team
			await db
				.delete(courses)
				.where(
					and(eq(courses.id, course.id), eq(courses.teamId, teamId))
				);

			// Delete the course users
			await db.delete(learners).where(eq(learners.courseId, course.id));
		}),
});
