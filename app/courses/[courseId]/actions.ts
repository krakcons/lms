"use server";

import { db } from "@/lib/db/db";
import { courseUsers } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";

export const updateCourseData = async (courseId: number, data: any) => {
	const userId = auth().userId;

	if (!userId) throw new Error("User not logged in");

	console.log("Updating course data", courseId, data);

	await db
		.update(courseUsers)
		.set({ data })
		.where(
			and(
				eq(courseUsers.courseId, courseId),
				eq(courseUsers.userId, userId)
			)
		);
};
