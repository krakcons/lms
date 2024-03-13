import { lucia } from "@/server/auth/lucia";
import { google } from "@/server/auth/providers";
import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { z } from "zod";

const GoogleCallbackSchema = z
	.object({
		code: z.string(),
		state: z.string(),
		storedState: z.string(),
		storedCodeVerifier: z.string(),
	})
	.refine((data) => data.state === data.storedState, {
		message: "State mismatch",
	});

export const GET = async (req: NextRequest) => {
	// Validation
	const searchParams = req.nextUrl.searchParams;

	const { code, storedCodeVerifier } = GoogleCallbackSchema.parse({
		code: searchParams.get("code"),
		state: searchParams.get("state"),
		storedState: cookies().get("state")?.value,
		storedCodeVerifier: cookies().get("codeVerifier")?.value,
	});

	console.log("callback");

	const tokens = await google.validateAuthorizationCode(
		code,
		storedCodeVerifier
	);
	const response = await fetch(
		"https://openidconnect.googleapis.com/v1/userinfo",
		{
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		}
	);
	const user: unknown = await response.json();
	const { sub: googleId, email } = z
		.object({
			sub: z.string(),
			email: z.string(),
		})
		.parse(user);

	let userId: string;
	const existingUser = await db.query.users.findFirst({
		where: eq(users.googleId, googleId),
	});

	if (!existingUser) {
		userId = generateId(15);
		await db.insert(users).values({
			id: userId,
			email,
			googleId,
		});
	} else {
		userId = existingUser.id;
	}

	const session = await lucia.createSession(userId, {
		email,
		googleId,
	});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes
	);

	redirect("/dashboard");
};
