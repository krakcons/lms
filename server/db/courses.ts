import { CreateCourse, SelectCourse, UpdateCourse } from "@/types/course";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { deleteFolder } from "../actions/s3";
import { LCDSError } from "../errors";
import { db } from "./db";
import { courses, learners, modules } from "./schema";

export const coursesData = {
	create: async (course: CreateCourse, userId: string) => {
		const c = await db
			.insert(courses)
			.values({ ...course, userId })
			.returning();
		return c[0];
	},
	get: cache(async ({ id }: SelectCourse, userId: string) => {
		const course = await db.query.courses.findFirst({
			where: and(eq(courses.id, id), eq(courses.userId, userId)),
		});

		if (!course) {
			throw new LCDSError({
				code: "NOT_FOUND",
				message: "Course not found",
			});
		}

		return course;
	}),
	update: async (newCourse: UpdateCourse, userId: string) => {
		const course = await coursesData.get({ id: newCourse.id }, userId);

		await db
			.update(courses)
			.set(newCourse)
			.where(
				and(eq(courses.id, newCourse.id), eq(courses.userId, userId))
			);

		return {
			...course,
			...newCourse,
		};
	},
	delete: async ({ id }: SelectCourse, userId: string) => {
		const course = await coursesData.get({ id }, userId);

		await db
			.delete(courses)
			.where(and(eq(courses.id, course.id), eq(courses.userId, userId)));

		const modulesList = await db.query.modules.findMany({
			where: eq(courses.id, course.id),
		});

		modulesList.forEach(async (module) => {
			await db.delete(learners).where(eq(learners.moduleId, module.id));
		});

		await db.delete(modules).where(eq(courses.id, course.id));

		await deleteFolder(`courses/${course.id}`);
	},
	getAll: cache(async (_: undefined, userId: string) => {
		return await db.query.courses.findMany({
			where: eq(courses.userId, userId),
		});
	}),
	getCourseWithModules: cache(
		async ({ id }: SelectCourse, userId: string) => {
			return await db.query.courses.findFirst({
				where: and(eq(courses.id, id), eq(courses.userId, userId)),
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
