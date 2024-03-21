import { getInitialScormData } from "@/lib/scorm";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import {
	CreateLearner,
	ExtendLearner,
	SelectLearner,
	UpdateLearner,
} from "@/types/learner";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { LCDSError } from "../errors";
import { svix } from "../svix";
import { modulesData } from "./modules";

export const learnersData = {
	create: async ({ moduleId, email, sendEmail, id }: CreateLearner) => {
		const courseModule = await modulesData.get({ id: moduleId });

		// Create a new learner
		const newLearner = {
			id: id ?? crypto.randomUUID(),
			moduleId: courseModule.id,
			email: email ? email : null,
			data: getInitialScormData(courseModule.type),
			contentType: courseModule.type,
		};

		// if (sendEmail && email) {
		// 	await inviteLearnerAction(newLearner.id, email, courseModule);
		// }

		await db.insert(learners).values(newLearner).onConflictDoNothing();

		return ExtendLearner(courseModule.type).parse(newLearner);
	},
	get: cache(async ({ id, moduleId }: SelectLearner) => {
		const courseModule = await modulesData.get({ id: moduleId });

		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, id), eq(learners.moduleId, moduleId)),
		});

		if (!learner) {
			throw new LCDSError({
				code: "NOT_FOUND",
				message: "Learner not found.",
			});
		}

		return ExtendLearner(courseModule.type).parse(learner);
	}),
	update: async ({ id, moduleId, data }: UpdateLearner) => {
		const courseModule = await modulesData.get({ id: moduleId });
		const learner = await learnersData.get({ id, moduleId });

		await db
			.update(learners)
			.set({ data })
			.where(and(eq(learners.moduleId, moduleId), eq(learners.id, id)));

		const newLearner = ExtendLearner(courseModule.type).parse({
			...learner,
			data,
		});

		await svix.message.create(`app_${moduleId}`, {
			eventType: "learner.update",
			payload: newLearner,
		});

		return newLearner;
	},
	delete: async ({ id, moduleId }: SelectLearner) => {
		await learnersData.get({ id, moduleId });

		await db
			.delete(learners)
			.where(and(eq(learners.id, id), eq(learners.moduleId, moduleId)));
	},
};
