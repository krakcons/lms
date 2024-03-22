import { db } from "@/server/db/db";
import { learnersData } from "@/server/db/learners";
import { learners } from "@/server/db/schema";
import { UpdateLearnerSchema } from "@/types/learner";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

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
	.delete("/:id", async (c) => {
		const { id } = c.req.param();

		await learnersData.get({ id });

		await db.delete(learners).where(and(eq(learners.id, id)));

		return c.json(null);
	});
