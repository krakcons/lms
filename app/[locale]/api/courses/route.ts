import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const getAPIAuth = async () => {
	const key = headers().get("x-api-key");
};

export const GET = async () => {
	return await db.query.courses.findMany({
		where: eq(courses.userId, user.id),
	});
};
