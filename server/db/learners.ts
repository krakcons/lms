import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { learners, teams } from "@/server/db/schema";
import { Course } from "@/types/course";
import { ExtendLearner, SelectLearner, UpdateLearner } from "@/types/learner";
import { renderAsync } from "@react-email/components";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import React, { cache } from "react";
import { resend } from "../resend";
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

		return ExtendLearner(learner.module?.type).parse(learner);
	}),
	update: async ({ id, moduleId, data }: UpdateLearner) => {
		let courseModule;
		if (moduleId) {
			courseModule = await modulesData.get({ id: moduleId });
		}
		const learner = await learnersData.get({ id });
		const newLearner = ExtendLearner(courseModule?.type).parse({
			...learner,
			data,
		});

		await db
			.update(learners)
			.set({
				data,
				startedAt: learner.startedAt ?? new Date(),
				completedAt: courseModule
					? !learner.completedAt && newLearner.status === "passed"
						? new Date()
						: null
					: null,
			})
			.where(eq(learners.id, id));

		return ExtendLearner(courseModule?.type).parse({
			...learner,
			data,
		});

		// await svix.message.create(`app_${moduleId}`, {
		// 	eventType: "learner.update",
		// 	payload: newLearner,
		// });
	},
	invite: async ({
		email,
		learnerId,
		course,
	}: {
		email: string;
		learnerId: string;
		course: Course;
	}) => {
		const team = await db.query.teams.findFirst({
			where: and(eq(teams.id, course.teamId)),
		});

		const href =
			team?.customDomain &&
			env.NEXT_PUBLIC_SITE_URL !== "http://localhost:3000"
				? `${team.customDomain}/courses/${course.id}?learnerId=${learnerId}`
				: `${env.NEXT_PUBLIC_SITE_URL}/play/${team?.id}/courses/${course.id}?learnerId=${learnerId}`;

		const html = await renderAsync(
			React.createElement(LearnerInvite, {
				email,
				course: course.name,
				organization: "Krak LMS",
				href,
			})
		);
		await resend.emails.send({
			html,
			to: email,
			subject: course.name,
			from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
		});
	},
};
