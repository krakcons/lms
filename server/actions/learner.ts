"use server";

import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { Course } from "@/types/course";
import {
	CreateLearnerSchema,
	DeleteLearnerSchema,
	SelectLearnerSchema,
	UpdateLearnerSchema,
} from "@/types/learner";
import { renderAsync } from "@react-email/components";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import React from "react";
import { z } from "zod";
import {
	createLearner,
	deleteLearner,
	getLearner,
	updateLearner,
} from "../db/learners";
import { resend } from "../resend";
import { action } from "./client";

export const inviteLearnerAction = async (
	id: string,
	email: string,
	course: Course
) => {
	const html = await renderAsync(
		React.createElement(LearnerInvite, {
			email,
			course: course.name,
			organization: "Krak LMS",
			href: `${env.NEXT_PUBLIC_SITE_URL}/play/${course.id}?learnerId=${id}`,
		})
	);
	await resend.emails.send({
		html,
		to: email,
		subject: course.name,
		from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
	});
};

export const createLearnerAction = action(
	CreateLearnerSchema,
	async (input) => {
		return await createLearner(input);
	}
);

export const getLearnerAction = action(SelectLearnerSchema, async (input) => {
	return await getLearner(input);
});

export const updateLearnerAction = action(
	UpdateLearnerSchema,
	async (input) => {
		return await updateLearner(input);
	}
);

export const deleteLearnerAction = action(
	DeleteLearnerSchema,
	async (input) => {
		await deleteLearner(input);
		revalidatePath(`/dashboard/courses/${input.courseId}/learners`);
	}
);

export const reinviteLearnerAction = action(
	z.object({
		id: z.string(),
		courseId: z.string(),
	}),
	async ({ id, courseId }) => {
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, id), eq(learners.courseId, courseId)),
			with: {
				course: true,
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
				course: learner.course.name,
				organization: "Krak LMS",
				href: `${env.NEXT_PUBLIC_SITE_URL}/play/${learner.course.id}?learnerId=${learner.id}`,
			})
		);
		await resend.emails.send({
			html,
			to: learner.email,
			subject: learner.course.name,
			from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
		});
	}
);
