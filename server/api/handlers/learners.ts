import { db } from "@/server/db/db";
import { learnersData } from "@/server/db/learners";
import { learners } from "@/server/db/schema";
import { UpdateLearnerSchema } from "@/types/learner";
import { LanguageSchema } from "@/types/translations";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

export const learnersHandler = new Hono()
	.get("/:id", async (c) => {
		const { id } = c.req.param();

		const learner = await learnersData.get({ id });

		return c.json(learner);
	})
	.put(
		"/:id",
		zValidator(
			"json",
			UpdateLearnerSchema.omit({
				id: true,
			})
		),
		async (c) => {
			const { id } = c.req.param();
			const input = c.req.valid("json");

			const newLearner = await learnersData.update({ ...input, id });

			return c.json(newLearner);
		}
	)
	.post(
		"/:id/reinvite",
		zValidator(
			"json",
			z.object({
				inviteLanguage: LanguageSchema,
			})
		),
		async (c) => {
			const { id } = c.req.param();
			const input = c.req.valid("json");

			const learner = await db.query.learners.findFirst({
				where: eq(learners.id, id),
				with: {
					course: {
						with: {
							translations: true,
						},
					},
				},
			});

			if (!learner) {
				throw new HTTPException(404, {
					message: "Learner not found.",
				});
			}

			await learnersData.courseInvite({
				...learner,
				inviteLanguage: input.inviteLanguage,
				learnerId: id,
			});

			return c.json(null);
		}
	)
	.delete("/:id", async (c) => {
		const { id } = c.req.param();

		await learnersData.get({ id });

		await db.delete(learners).where(and(eq(learners.id, id)));

		return c.json(null);
	});
