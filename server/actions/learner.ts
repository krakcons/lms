"use server";

import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { getInitialScormData } from "@/lib/scorm";
import { db } from "@/server/db/db";
import { courses, learners } from "@/server/db/schema";
import { svix } from "@/server/svix";
import { Course } from "@/types/course";
import {
	CreateLearnerSchema,
	DeleteLearnerSchema,
	ExtendLearner,
	LearnerSchema,
	SelectLearnerSchema,
	UpdateLearnerSchema,
} from "@/types/learner";
import { renderAsync } from "@react-email/components";
import { and, eq } from "drizzle-orm";
import React from "react";
import { z } from "zod";
import { resend } from "../resend";
import { action } from "./client";

const inviteLearner = async (id: string, email: string, course: Course) => {
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

export const createLearner = action(
	CreateLearnerSchema,
	async ({ email = null, sendEmail = false, courseId, id }) => {
		if (id === "") {
			id = undefined;
		}

		if (id) {
			const learner = await db.query.learners.findFirst({
				where: and(eq(learners.id, id)),
			});
			if (learner) {
				throw new Error("Learner already exists with that identifier");
			}
		}

		// Check if learner already exists by email
		if (email) {
			const learner = await db.query.learners.findFirst({
				where: and(
					eq(learners.email, email),
					eq(learners.courseId, courseId)
				),
			});

			if (learner) {
				throw new Error("Learner is already a member of this course");
			}
		}

		const course = await db.query.courses.findFirst({
			where: eq(courses.id, courseId),
		});

		if (!course) {
			throw new Error("Course not found");
		}

		// Create a new learner
		const newLearner = {
			id: id ?? crypto.randomUUID(),
			courseId: course.id,
			email,
			data: getInitialScormData(course.version),
			version: course.version,
		};

		if (sendEmail && email) {
			await inviteLearner(newLearner.id, email, course);
		}

		await db.insert(learners).values(newLearner);

		return ExtendLearner.parse(newLearner);
	}
);

export const getLearner = action(
	SelectLearnerSchema,
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

		return ExtendLearner.parse(learner);
	}
);

export const getLearners = action(
	LearnerSchema.pick({ courseId: true }),
	async ({ courseId }) => {
		const learnerList = await db.query.learners.findMany({
			where: eq(learners.courseId, courseId),
		});

		return ExtendLearner.array().parse(learnerList);
	}
);

export const updateLearner = action(
	UpdateLearnerSchema,
	async ({ id, courseId, ...rest }) => {
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, id), eq(learners.courseId, courseId)),
		});
		const oldLearner = ExtendLearner.parse(learner);

		if (!learner) {
			throw new Error("Learner not found");
		}

		await db
			.update(learners)
			.set({ ...rest })
			.where(and(eq(learners.courseId, courseId), eq(learners.id, id)));

		const newLearner = ExtendLearner.parse({
			...learner,
			...rest,
		});

		// Send update to SVIX
		if (
			oldLearner.status !== newLearner.status ||
			oldLearner.score.max !== newLearner.score.max ||
			oldLearner.score.min !== newLearner.score.min ||
			oldLearner.score.raw !== newLearner.score.raw ||
			oldLearner.email !== newLearner.email
		) {
			console.log("Sending update to SVIX");
			await svix.message.create(`app_${courseId}`, {
				eventType: "learner.update",
				payload: newLearner,
			});
		}

		return newLearner;
	}
);

export const deleteLearner = action(
	DeleteLearnerSchema,
	async ({ id, courseId }) => {
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, id), eq(learners.courseId, courseId)),
		});

		if (!learner) {
			throw new Error("Learner not found");
		}

		await db
			.delete(learners)
			.where(and(eq(learners.id, id), eq(learners.courseId, courseId)));

		return ExtendLearner.parse(learner);
	}
);

export const reinviteLearner = action(
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
