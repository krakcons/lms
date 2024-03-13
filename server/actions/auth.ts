"use server";

import { redirect } from "@/lib/navigation";
import { lucia } from "@/server/auth/lucia";
import { cookies } from "next/headers";

type Options = {
	redirect?: boolean;
};

export const getAuth = async (options?: Options) => {
	const sessionId = cookies().get("auth_session");

	if (!sessionId?.value) {
		if (options?.redirect) {
			console.log("redirecting");
			redirect("/auth/google");
		}
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
