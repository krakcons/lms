"use server";

import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { renderAsync } from "@react-email/components";
import { and, eq } from "drizzle-orm";
import React from "react";
import { z } from "zod";
import { resend } from "../resend";
import { action } from "./client";

export const reinviteLearnerAction = action(
	z.object({
		id: z.string(),
		moduleId: z.string(),
	}),
	async ({ id, moduleId }) => {
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, id), eq(learners.moduleId, moduleId)),
			with: {
				module: {
					with: {
						course: true,
					},
				},
			},
		});

		if (!learner) {
			throw new Error("Learner not found");
		}

		if (!learner.email) {
			throw new Error("Learner has no email");
		}

		const html = await renderAsync(
			React.createElement(LearnerInvite, {
				email: learner.email,
				course: learner.module.course.name,
				organization: "Krak LMS",
				href: `${env.NEXT_PUBLIC_SITE_URL}/play/${learner.module.course.id}?learnerId=${learner.id}`,
			})
		);
		await resend.emails.send({
			html,
			to: learner.email,
			subject: learner.module.course.name,
			from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
		});
	}
);
