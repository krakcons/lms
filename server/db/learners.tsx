import CourseCompletion from "@/emails/CourseCompletion";
import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { learners, teams } from "@/server/db/schema";
import { Course, CourseTranslation } from "@/types/course";
import {
	CreateLearner,
	ExtendLearner,
	SelectLearner,
	UpdateLearner,
} from "@/types/learner";
import { renderAsync } from "@react-email/components";
import { pdf } from "@react-pdf/renderer";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateId } from "lucia";
import React, { cache } from "react";
import { resend } from "../resend";
import { modulesData } from "./modules";

const generatePdfBuffer = async (element: React.ReactElement) => {
	const blob = await pdf(element).toBlob();
	const arrayBuffer = await blob.arrayBuffer();
	return Buffer.from(arrayBuffer);
};

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
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, id)),
		});

		if (!learner) {
			throw new HTTPException(404, {
				message: "Learner not found.",
			});
		}

		const newLearner = ExtendLearner(courseModule?.type).parse({
			...learner,
			data,
		});

		const justCompleted =
			!learner.completedAt && newLearner.status === "passed";

		const completedAt =
			courseModule && justCompleted ? new Date() : learner.completedAt;

		await db
			.update(learners)
			.set({
				data,
				completedAt,
			})
			.where(eq(learners.id, id));

		if (justCompleted) {
			const learner = await db.query.learners.findFirst({
				where: eq(learners.id, id),
				with: {
					course: {
						with: {
							team: {
								with: {
									translations: true,
								},
							},
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

			const href =
				learner.course.team?.customDomain &&
				env.NEXT_PUBLIC_SITE_URL !== "http://localhost:3000"
					? `${learner.course.team.customDomain}/courses/${learner.course.id}/certificate?learnerId=${learner.id}`
					: `${env.NEXT_PUBLIC_SITE_URL}/play/${learner.course.team?.id}/courses/${learner.course.id}/certificate?learnerId=${learner.id}`;

			const html = await renderAsync(
				React.createElement(CourseCompletion, {
					course: translate(
						learner.course.translations,
						courseModule?.language
					).name,
					organization: translate(learner.course.team.translations)
						.name,
					href,
				})
			);

			const { error } = await resend.emails.send({
				html,
				to: learner.email,
				subject: translate(
					learner.course.translations,
					courseModule?.language
				).name,
				from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
			});

			if (error) {
				throw new HTTPException(500, {
					message: "Failed to send email",
					cause: error,
				});
			}
		}

		return { ...newLearner, completedAt };

		// await svix.message.create(`app_${moduleId}`, {
		// 	eventType: "learner.update",
		// 	payload: newLearner,
		// });
	},
	create: async (
		input: Omit<CreateLearner, "moduleId" | "courseId">[],
		courses: (Course & { translations: CourseTranslation[] })[]
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
		course: Course & { translations: CourseTranslation[] };
	}) => {
		const team = await db.query.teams.findFirst({
			where: and(eq(teams.id, course.teamId)),
			with: {
				translations: true,
			},
		});

		if (!team) {
			throw new HTTPException(404, {
				message: "Team not found.",
			});
		}

		const href =
			team?.customDomain &&
			env.NEXT_PUBLIC_SITE_URL !== "http://localhost:3000"
				? `${team.customDomain}/courses/${course.id}/join?learnerId=${learnerId}`
				: `${env.NEXT_PUBLIC_SITE_URL}/play/${team?.id}/courses/${course.id}/join?learnerId=${learnerId}`;

		const html = await renderAsync(
			React.createElement(LearnerInvite, {
				course: translate(course.translations).name,
				organization: translate(team.translations).name,
				href,
			})
		);

		const { data, error } = await resend.emails.send({
			html,
			to: email,
			subject: translate(course.translations).name,
			from: `${translate(team.translations).name} <noreply@lcds.krakconsultants.com>`,
		});

		console.log("error", error);
		console.log("data", data);

		if (error) {
			throw new HTTPException(500, {
				message: "Failed to send email",
				cause: error,
			});
		}
	},
};
