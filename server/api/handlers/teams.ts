import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { teams } from "@/server/db/schema";
import { TeamSchema } from "@/types/team";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authedMiddleware } from "../middleware";

export const teamsHandler = new Hono()
	.put(
		"/",
		zValidator("json", TeamSchema.omit({ id: true })),
		authedMiddleware,
		async (c) => {
			const teamId = c.get("teamId");
			const { name, customDomain } = c.req.valid("json");

			if (customDomain) {
				const res = await fetch(
					`https://api.vercel.com/v10/projects/${env.PROJECT_ID_VERCEL}/domains?teamId=${env.TEAM_ID_VERCEL}`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${env.AUTH_BEARER_TOKEN_VERCEL}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							name: customDomain,
							// TODO: Redirect www. to root domain
							// ...(domain.startsWith("www.") && {
							//   redirect: domain.replace("www.", ""),
							// }),
						}),
					}
				);
				if (!res.ok) {
					console.log("ERROR", await res.text());
					throw new HTTPException(500, {
						message: "Failed to add domain to Vercel.",
					});
				}

				// TODO: Remove domain from Vercel if new one is added
			}

			await db
				.update(teams)
				.set({
					name,
					customDomain,
				})
				.where(eq(teams.id, teamId));

			return c.json(null);
		}
	)
	.get("/:id/domain", async (c) => {
		const { id } = c.req.param();

		const team = await db.query.teams.findFirst({
			where: eq(teams.id, id),
		});

		if (!team) {
			throw new HTTPException(404, {
				message: "Team not found.",
			});
		}

		const res = await fetch(
			`https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${team?.customDomain}?teamId=${process.env.TEAM_ID_VERCEL}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
					"Content-Type": "application/json",
				},
			}
		);
		const data = await res.json();
		return c.json(data);
	});
