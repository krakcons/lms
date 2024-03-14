import { db } from "@/server/db/db";
import { courses, keys } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const getAPIAuth = async () => {
	const apiKey = headers().get("x-api-key");

	if (!apiKey) {
		return null;
	}

	const key = await db.query.keys.findFirst({
		where: eq(keys.key, apiKey),
		with: {
			user: true,
		},
	});

	return key ? key.user : null;
};

export const GET = async () => {
	const user = await getAPIAuth();
	if (!user) return new Response(null, { status: 401 });

	const courseList = await db.query.courses.findMany({
		where: eq(courses.userId, user.id),
	});

	return NextResponse.json(courseList);
};
