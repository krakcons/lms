import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { teamTranslations, teams } from "@/server/db/schema";
import { UpdateTeamTranslationSchema } from "@/types/team";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authedMiddleware } from "../middleware";

export const teamsHandler = new Hono()
	.put(
		"/:id",
		zValidator(
			"json",
			UpdateTeamTranslationSchema.extend({
				customDomain: z.string().optional(),
			})
		),
		authedMiddleware,
		async (c) => {
			const id = c.req.param("id");
			const teamId = c.get("teamId");

			if (id !== teamId) {
				throw new HTTPException(401, {
					message: "Unauthorized",
				});
			}

			const { customDomain, ...input } = c.req.valid("json");

			const team = await db.query.teams.findFirst({
				where: eq(teams.id, teamId),
			});

			if (customDomain && team?.customDomain !== customDomain) {
				if (team?.customDomain) {
					const res = await fetch(
						`https://api.vercel.com/v9/projects/${env.PROJECT_ID_VERCEL}/domains/${team.customDomain}?teamId=${env.TEAM_ID_VERCEL}`,
						{
							headers: {
								Authorization: `Bearer ${env.AUTH_BEARER_TOKEN_VERCEL}`,
							},
							method: "DELETE",
						}
					);
				}
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
						}),
					}
				);
				if (!res.ok) {
					console.log("ERROR", await res.text());
					throw new HTTPException(500, {
						message: "Failed to add domain to Vercel.",
					});
				}
			}

			await db
				.insert(teamTranslations)
				.values({
					...input,
					teamId,
				})
				.onConflictDoUpdate({
					set: input,
					target: [
						teamTranslations.teamId,
						teamTranslations.language,
					],
				});

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
