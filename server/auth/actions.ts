"use server";

import { redirect } from "@/lib/navigation";
import { lucia } from "@/server/auth/lucia";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "../db/db";
import { usersToTeams } from "../db/schema";

export const getAuth = cache(async () => {
	const sessionId = cookies().get("auth_session");

	if (!sessionId?.value) {
		return {
			user: null,
			session: null,
		};
	}

	return await lucia.validateSession(sessionId.value);
});

export const logout = async () => {
	const session = cookies().get("auth_session");
	if (!session?.value) return;
	const blankCookie = lucia.createBlankSessionCookie();
	cookies().set(blankCookie.name, blankCookie.value, blankCookie.attributes);
	await lucia.invalidateSession(session.value);
};

export const getTeam = cache(async (id: string, userId: string) => {
	const userToTeam = await db.query.usersToTeams.findFirst({
		where: and(
			eq(usersToTeams.teamId, id),
			eq(usersToTeams.userId, userId)
		),
		with: {
			team: true,
		},
	});
	return userToTeam?.team;
});

export const getUserRole = cache(async (teamId: string) => {
	const user = await getAuth();

	if (!user.user) {
		return redirect("/auth/google");
	}

	const userToTeam = await db.query.usersToTeams.findFirst({
		where: and(
			eq(usersToTeams.userId, user.user?.id),
			eq(usersToTeams.teamId, teamId)
		),
	});

	return userToTeam!.role;
});
