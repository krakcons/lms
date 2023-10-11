import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { env } from "@/env.mjs";
import { deleteCourseFiles, getAllCourseFiles } from "@/lib/files";
import { NextResponse } from "next/server";

// Deletes all course files that are not in the database
export const GET = async (req: Request) => {
	const authHeader = req.headers.get("authorization");
	if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
		return NextResponse.json(
			{ message: "Unauthorized" },
			{
				status: 401,
			}
		);
	}

	const courseFiles = await getAllCourseFiles();
	const courseIds = await db.select({ id: courses.id }).from(courses);

	const coursesToDelete = courseFiles.Contents?.filter(
		(c) => !courseIds.find((course) => course.id === c.Key?.split("/")[1])
	);

	if (!coursesToDelete?.length)
		return NextResponse.json({ message: "No courses to delete." });

	const ids = coursesToDelete
		.map((c) => c.Key?.split("/")[1])
		.filter((c) => c) as string[];

	await deleteCourseFiles(ids);

	return NextResponse.json({
		message: "Successfully deleted unused courses",
		ids,
	});
};
