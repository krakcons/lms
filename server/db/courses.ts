import { SelectCourse, UpdateCourse } from "@/types/course";
import { and, eq } from "drizzle-orm";
import { deleteFolder } from "../actions/s3";
import { LCDSError } from "../errors";
import { db } from "./db";
import { courses, learners } from "./schema";

export const getCourse = async ({ id }: SelectCourse, userId: string) => {
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
};

export const updateCourse = async (newCourse: UpdateCourse, userId: string) => {
	const course = await getCourse({ id: newCourse.id }, userId);

	await db
		.update(courses)
		.set(newCourse)
		.where(and(eq(courses.id, newCourse.id), eq(courses.userId, userId)));

	return {
		...course,
		...newCourse,
	};
};

export const deleteCourse = async ({ id }: SelectCourse, userId: string) => {
	const course = await getCourse({ id }, userId);

	await db
		.delete(courses)
		.where(and(eq(courses.id, course.id), eq(courses.userId, userId)));
	await db.delete(learners).where(eq(learners.courseId, course.id));
	await deleteFolder(`courses/${course.id}`);
};

export const getCourses = async (_: undefined, userId: string) => {
	return await db.query.courses.findMany({
		where: eq(courses.userId, userId),
	});
};

export const getCourseUnauthed = async ({ id }: SelectCourse) => {
	const course = await db.query.courses.findFirst({
		where: eq(courses.id, id),
	});

	if (!course) {
		throw new LCDSError({
			code: "NOT_FOUND",
			message: "Course not found",
		});
	}

	return course;
};
