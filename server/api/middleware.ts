import { lucia } from "@/server/auth/lucia";
import { db } from "@/server/db/db";
import { keys } from "@/server/db/schema";
import { User } from "@/types/users";
import { eq } from "drizzle-orm";
import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";

export const authedMiddleware: MiddlewareHandler<{
	Variables: {
		user: User;
	};
}> = async (c, next) => {
	const apiKey = c.req.header("x-api-key");
	const sessionId = getCookie(c, "auth_session");

	if (apiKey) {
		const key = await db.query.keys.findFirst({
			where: eq(keys.key, apiKey),
			with: {
				user: true,
			},
		});

		if (key) {
			c.set("user", key.user);
			return await next();
		}
	} else if (sessionId) {
		const user = await lucia.validateSession(sessionId);

		if (!user.user) {
			return c.text("Invalid session", 401);
		}

		c.set("user", user.user);

		return await next();
	} else {
		return c.text("API key or session required.", 401);
	}
};
