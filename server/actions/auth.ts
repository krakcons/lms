"use server";

import { lucia } from "@/server/auth/lucia";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../db/db";
import { teams } from "../db/schema";

export const getAuth = async () => {
	const sessionId = cookies().get("auth_session");

	if (!sessionId?.value) {
		return {
			user: null,
			session: null,
		};
	}

	return await lucia.validateSession(sessionId.value);
};

export const logout = async () => {
	const session = cookies().get("auth_session");
	if (!session?.value) return;
	const blankCookie = lucia.createBlankSessionCookie();
	cookies().set(blankCookie.name, blankCookie.value, blankCookie.attributes);
	await lucia.invalidateSession(session.value);
};

export const getTeam = async (id: string, userId: string) => {
	return await db.query.teams.findFirst({
		where: eq(teams.id, id === "personal" ? userId : id),
	});
};
