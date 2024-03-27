import { CreateCourse, SelectCourse, UpdateCourse } from "@/types/course";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { deleteFolder } from "../actions/s3";
import { LCDSError } from "../errors";
import { db } from "./db";
import { courses, learners, modules } from "./schema";

export const coursesData = {
	create: async (course: CreateCourse, teamId: string) => {
		const c = await db
			.insert(courses)
			.values({ ...course, teamId })
			.returning();
		return c[0];
	},
	get: cache(async ({ id }: SelectCourse, teamId: string) => {
		const course = await db.query.courses.findFirst({
			where: and(eq(courses.id, id), eq(courses.teamId, teamId)),
		});

		if (!course) {
			throw new LCDSError({
				code: "NOT_FOUND",
				message: "Course not found",
			});
		}

		return course;
	}),
	update: async (newCourse: UpdateCourse, teamId: string) => {
		const course = await coursesData.get({ id: newCourse.id }, teamId);

		await db
			.update(courses)
			.set(newCourse)
			.where(
				and(eq(courses.id, newCourse.id), eq(courses.teamId, teamId))
			);

		return {
			...course,
			...newCourse,
		};
	},
	delete: async ({ id }: SelectCourse, teamId: string) => {
		const course = await coursesData.get({ id }, teamId);

		await db
			.delete(courses)
			.where(and(eq(courses.id, course.id), eq(courses.teamId, teamId)));

		const modulesList = await db.query.modules.findMany({
			where: eq(courses.id, course.id),
		});

		modulesList.forEach(async (module) => {
			await db.delete(learners).where(eq(learners.moduleId, module.id));
		});

		await db.delete(modules).where(eq(courses.id, course.id));

		await deleteFolder(`${teamId}/courses/${course.id}`);
	},
	getAll: cache(async (_: undefined, teamId: string) => {
		return await db.query.courses.findMany({
			where: eq(courses.teamId, teamId),
		});
	}),
	getCourseWithModules: cache(
		async ({ id }: SelectCourse, teamId: string) => {
			return await db.query.courses.findFirst({
				where: and(eq(courses.id, id), eq(courses.teamId, teamId)),
				with: {
					modules: {
						with: {
							learners: true,
						},
					},
				},
			});
		}
	),
};
