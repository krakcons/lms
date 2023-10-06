import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const getCourse = async ({
	id,
	teamId,
	learners,
}: {
	id: string;
	teamId: string;
	learners?: true;
}) => {
	const course = await db.query.courses.findFirst({
		where: and(eq(courses.id, id), eq(courses.teamId, teamId)),
		with: {
			learners,
		},
	});

	if (!course) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Course not found or does not belong to you",
		});
	}

	return course;
};
