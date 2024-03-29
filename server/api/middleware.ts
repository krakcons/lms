import { lucia } from "@/server/auth/lucia";
import { db } from "@/server/db/db";
import { keys } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { getTeam } from "../auth/actions";

export const authedMiddleware: MiddlewareHandler<{
	Variables: {
		teamId: string;
	};
}> = async (c, next) => {
	const apiKey = c.req.header("x-api-key");
	const sessionId = getCookie(c, "auth_session");

	if (apiKey) {
		const key = await db.query.keys.findFirst({
			where: eq(keys.key, apiKey),
		});

		if (key) {
			c.set("teamId", key.teamId);
			return await next();
		}
	} else if (sessionId) {
		const user = await lucia.validateSession(sessionId);

		if (!user.user) {
			return c.text("Invalid session", 401);
		}

		// TODO: Identify the current team
		const team = await getTeam(user.user.id, user.user.id);

		if (!team) {
			return c.text("Invalid team", 401);
		}

		c.set("teamId", team.id);

		return await next();
	} else {
		return c.text("API key or session required.", 401);
	}
};
