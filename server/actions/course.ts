"use server";

import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { svix } from "@/server/svix";
import { DeleteCourseSchema, UploadCourseSchema } from "@/types/course";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteCourse } from "../db/courses";
import { authAction } from "./client";

export const deleteCourseAction = authAction(
	DeleteCourseSchema,
	async (input, { user }) => {
		await deleteCourse(input, user.id);
		revalidatePath("/dashboard");
	}
);

export const uploadCourseAction = authAction(
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
