import { google } from "@/server/auth/providers";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const GET = async () => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url: URL = await google.createAuthorizationURL(state, codeVerifier, {
		scopes: ["profile", "email"],
	});

	cookies().set("state", state, {
		secure: process.env.NODE_ENV === "production",
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 min
	});

	cookies().set("codeVerifier", codeVerifier, {
		secure: process.env.NODE_ENV === "production",
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 min
	});

	redirect(url.toString());
};
