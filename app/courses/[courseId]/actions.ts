"use server";

import { db } from "@/lib/db/db";
import { courseUsers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const updateCourseData = async (
	courseId: string,
	data: any,
	courseUserId: string
) => {
	console.log("Updating course data", courseId, data);

	await db
		.update(courseUsers)
		.set({ data })
		.where(
			and(
				eq(courseUsers.courseId, courseId),
				eq(courseUsers.id, courseUserId)
			)
		);
};
