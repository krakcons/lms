import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { learners, teams } from "@/server/db/schema";
import { Course } from "@/types/course";
import {
	CreateLearner,
	ExtendLearner,
	SelectLearner,
	UpdateLearner,
} from "@/types/learner";
import { renderAsync } from "@react-email/components";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateId } from "lucia";
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

		const completedAt = courseModule
			? !learner.completedAt && newLearner.status === "passed"
				? new Date()
				: null
			: null;

		await db
			.update(learners)
			.set({
				data,
				completedAt,
			})
			.where(eq(learners.id, id));

		return { ...newLearner, completedAt };

		// await svix.message.create(`app_${moduleId}`, {
		// 	eventType: "learner.update",
		// 	payload: newLearner,
		// });
	},
	create: async (
		input: Omit<CreateLearner, "moduleId" | "courseId">[],
		courses: Course[]
	) => {
		const learnerList = courses.flatMap(({ id }) =>
			input.map((learner) => {
				// Create a new learner
				return {
					...learner,
					id: learner.id ?? generateId(32),
					moduleId: null,
					courseId: id,
					data: {},
					completedAt: null,
					startedAt: null,
				};
			})
		);

		await db.insert(learners).values(learnerList).onConflictDoNothing();

		const emailList = learnerList
			.filter((learner) => learner.sendEmail !== false && learner.email)
			.map((learner) => {
				return {
					email: learner.email,
					learnerId: learner.id,
					course: courses.find(
						(course) => course.id === learner.courseId
					)!,
				};
			});

		await Promise.allSettled(
			emailList.map((learner) => {
				return learnersData.invite(learner);
			})
		);

		if (learnerList.length === 1) {
			return ExtendLearner().parse(learnerList[0]);
		} else {
			return ExtendLearner().array().parse(learnerList);
		}
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
				? `${team.customDomain}/courses/${course.id}/join?learnerId=${learnerId}`
				: `${env.NEXT_PUBLIC_SITE_URL}/play/${team?.id}/courses/${course.id}/join?learnerId=${learnerId}`;

		const html = await renderAsync(
			React.createElement(LearnerInvite, {
				email,
				course: course.name,
				organization: "Krak LMS",
				href,
			})
		);

		const { data, error } = await resend.emails.send({
			html,
			to: email,
			subject: course.name,
			from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
		});

		if (error) {
			throw new HTTPException(500, {
				message: "Failed to send email",
				cause: error,
			});
		}
	},
};
