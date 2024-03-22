import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { ExtendLearner, SelectLearner, UpdateLearner } from "@/types/learner";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { cache } from "react";
import { modulesData } from "./modules";

export const learnersData = {
	get: cache(async ({ id }: SelectLearner) => {
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, id)),
			with: {
				module: true,
			},
		});

		if (!learner) {
			throw new HTTPException(404, {
				message: "Learner not found.",
			});
		}

		return ExtendLearner(learner.module.type).parse(learner);
	}),
	update: async ({ id, moduleId, data }: UpdateLearner) => {
		const courseModule = await modulesData.get({ id: moduleId });
		const learner = await learnersData.get({ id });

		await db
			.update(learners)
			.set({ data })
			.where(and(eq(learners.moduleId, moduleId), eq(learners.id, id)));

		const newLearner = ExtendLearner(courseModule.type).parse({
			...learner,
			data,
		});

		// await svix.message.create(`app_${moduleId}`, {
		// 	eventType: "learner.update",
		// 	payload: newLearner,
		// });

		return newLearner;
	},
};
