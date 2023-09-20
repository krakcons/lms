"use server";

import { db } from "@/db/db";
import { learners } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const updateCourseData = async (
	courseId: string,
	data: any,
	learnerId: string
) => {
	console.log("Updating course data", courseId, data);

	await db
		.update(learners)
		.set({ data })
		.where(
			and(eq(learners.courseId, courseId), eq(learners.id, learnerId))
		);
};
