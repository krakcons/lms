import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { teamTranslations, teams } from "@/server/db/schema";
import { getPresignedUrl } from "@/server/r2";
import { resend } from "@/server/resend";
import { Team, UpdateTeamTranslationSchema } from "@/types/team";
import { LanguageSchema } from "@/types/translations";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authedMiddleware } from "../middleware";

const removeDomain = async ({
	customDomain,
	resendDomainId,
}: {
	customDomain: Team["customDomain"];
	resendDomainId?: Team["resendDomainId"];
}) => {
	if (customDomain) {
		const res = await fetch(
			`https://api.vercel.com/v9/projects/${env.PROJECT_ID_VERCEL}/domains/${customDomain}?teamId=${env.TEAM_ID_VERCEL}`,
			{
				headers: {
					Authorization: `Bearer ${env.AUTH_BEARER_TOKEN_VERCEL}`,
				},
				method: "DELETE",
			}
		);
		console.log("VERCEL DELETE", res.status, await res.text());
	}
	if (resendDomainId) {
		const res = await resend.domains.remove(resendDomainId);
		console.log("RESEND DELETE", res.error, res.data);
	}
};

export const teamsHandler = new Hono()
	.put(
		"/:id",
		zValidator("json", UpdateTeamTranslationSchema),
		authedMiddleware,
		async (c) => {
			const id = c.req.param("id");
			const teamId = c.get("teamId");

			if (id !== teamId) {
				throw new HTTPException(401, {
					message: "Unauthorized",
				});
			}

			const input = c.req.valid("json");

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
	.put(
		"/:id/domain",
		zValidator(
			"json",
			z.object({
				customDomain: z.string(),
			})
		),
		authedMiddleware,
		async (c) => {
			const { id } = c.req.param();
			const { customDomain } = c.req.valid("json");

			const team = await db.query.teams.findFirst({
				where: eq(teams.id, id),
			});

			if (!team) {
				throw new HTTPException(404, {
					message: "Team not found.",
				});
			}

			let resendDomainId: string | null = null;

			if (team.customDomain !== customDomain) {
				// Add the new domain
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
					console.log("ERROR (VERCEL)", await res.text());
					throw new HTTPException(500, {
						message: "Failed to add domain to Vercel.",
					});
				}
				const resendRes = await resend.domains.create({
					name: customDomain,
				});
				if (resendRes.error) {
					// Rollback
					await removeDomain({
						customDomain,
					});
					console.log("ERROR (RESEND)", resendRes.error.message);
					throw new HTTPException(500, {
						message: "Failed to add domain to Resend.",
					});
				}
				resendDomainId = resendRes.data!.id;
				// Remove the old domain
				await removeDomain({
					customDomain: team.customDomain,
					resendDomainId: team.resendDomainId,
				});
			} else {
				throw new HTTPException(400, {
					message: "That domain is already set.",
				});
			}

			// Update the team in the database
			await db
				.update(teams)
				.set({
					customDomain,
					resendDomainId,
				})
				.where(eq(teams.id, id));

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
	})
	.delete("/:id/domain", authedMiddleware, async (c) => {
		const { id } = c.req.param();

		const team = await db.query.teams.findFirst({
			where: eq(teams.id, id),
		});

		if (!team) {
			throw new HTTPException(404, {
				message: "Team not found.",
			});
		}

		await removeDomain({
			customDomain: team.customDomain,
			resendDomainId: team.resendDomainId,
		});

		await db
			.update(teams)
			.set({
				customDomain: null,
				resendDomainId: null,
			})
			.where(eq(teams.id, id));

		return c.json(null);
	})
	.post(
		"/logo",
		zValidator(
			"json",
			z.object({
				language: LanguageSchema,
			})
		),
		authedMiddleware,
		async (c) => {
			const language = c.req.valid("json").language;
			const teamId = c.get("teamId");

			const imageUrl = `${teamId}/${language}/logo`;
			const url = await getPresignedUrl(imageUrl);

			return c.json({ url, imageUrl });
		}
	)
	.post(
		"/favicon",
		zValidator(
			"json",
			z.object({
				language: LanguageSchema,
			})
		),
		authedMiddleware,
		async (c) => {
			const language = c.req.valid("json").language;
			const teamId = c.get("teamId");

			const imageUrl = `${teamId}/${language}/favicon`;
			const url = await getPresignedUrl(imageUrl);

			return c.json({ url, imageUrl });
		}
	);
