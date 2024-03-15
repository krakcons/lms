"use server";

import { lucia } from "@/server/auth/lucia";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { db } from "../db/db";
import { keys } from "../db/schema";
import { LCDSError } from "../errors";

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

// Get user from API key, if no key, check session
export const getAPIAuth = async () => {
	const apiKey = headers().get("x-api-key");

	if (!apiKey) {
		throw new LCDSError({
			code: "UNAUTHORIZED",
			message: "API key required.",
		});
	}

	const key = await db.query.keys.findFirst({
		where: eq(keys.key, apiKey),
		with: {
			user: true,
		},
	});

	if (!key) {
		throw new LCDSError({
			code: "UNAUTHORIZED",
			message: "Invalid API key.",
		});
	}

	return key.user;
};

export const logout = async () => {
	const session = cookies().get("auth_session");
	if (!session?.value) return;
	const blankCookie = lucia.createBlankSessionCookie();
	cookies().set(blankCookie.name, blankCookie.value, blankCookie.attributes);
	await lucia.invalidateSession(session.value);
};
