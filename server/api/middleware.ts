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
		userId?: string;
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

		c.set("userId", user.user.id);

		const teamId = getCookie(c, "teamId");

		if (!teamId) {
			return c.text("Team ID required", 401);
		}

		const team = await getTeam(teamId, user.user.id);

		if (!team) {
			return c.text("Invalid team", 401);
		}

		c.set("teamId", team.id);

		return await next();
	} else {
		return c.text("API key or session required.", 401);
	}
};

export const userMiddleware: MiddlewareHandler<{
	Variables: {
		userId: string;
	};
}> = async (c, next) => {
	const sessionId = getCookie(c, "auth_session");

	if (sessionId) {
		const user = await lucia.validateSession(sessionId);

		if (!user.user) {
			return c.text("Invalid session", 401);
		}

		c.set("userId", user.user.id);

		return await next();
	} else {
		return c.text("Session required", 401);
	}
};
