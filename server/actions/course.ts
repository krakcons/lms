"use server";

import { db } from "@/server/db/db";
import { courses, learners } from "@/server/db/schema";
import { svix } from "@/server/svix";
import {
	DeleteCourseSchema,
	SelectCourseSchema,
	UpdateCourseSchema,
	UploadCourseSchema,
} from "@/types/course";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { authAction } from "./client";
import { deleteFolder } from "./s3";

export const getCourse = authAction(
	SelectCourseSchema,
	async ({ id }, { user }) => {
		const course = await db.query.courses.findFirst({
			where: and(eq(courses.id, id), eq(courses.userId, user.id)),
			with: {
				learners: true,
			},
		});

		if (!course) {
			throw new Error("Course not found or does not belong to you");
		}

		return course;
	}
);

export const getCourses = authAction(z.undefined(), async (_, { user }) => {
	return await db.query.courses.findMany({
		where: eq(courses.userId, user.id),
	});
});

export const deleteCourse = authAction(
	DeleteCourseSchema,
	async ({ id }, { user }) => {
		await db
			.delete(courses)
			.where(and(eq(courses.id, id), eq(courses.userId, user.id)));
		await db.delete(learners).where(eq(learners.courseId, id));
		await deleteFolder(`courses/${id}`);

		return undefined;
	}
);

export const updateCourse = authAction(
	UpdateCourseSchema,
	async ({ id, ...rest }, { user }) => {
		await db
			.update(courses)
			.set({ ...rest })
			.where(and(eq(courses.id, id), eq(courses.userId, user.id)));
	}
);

export const uploadCourse = authAction(
	UploadCourseSchema,
	async ({ name, version, id }, { user }) => {
		if (id === "") {
			id = undefined;
		}

		if (id) {
			const course = await db.query.courses.findFirst({
				where: and(eq(courses.id, id)),
			});
			if (course) {
				throw new Error("Course already exists with that identifier");
			}
		}

		const insertId = id ?? crypto.randomUUID();

		// Create a new course and svix app
		await db.insert(courses).values({
			id: insertId,
			userId: user.id,
			name,
			version,
		});

		await svix.application.create({
			name: `app_${insertId}`,
			uid: `app_${insertId}`,
		});

		return {
			courseId: insertId,
		};
	}
);
