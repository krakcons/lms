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
import { Language } from "@/types/translations";
import { renderAsync } from "@react-email/components";
import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateId } from "lucia";
import { getTranslations } from "next-intl/server";
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
					? `${learner.course.team.customDomain}${courseModule ? `/${courseModule.language}` : ""}/courses/${learner.course.id}/certificate?learnerId=${learner.id}`
					: `${env.NEXT_PUBLIC_SITE_URL}${courseModule ? `/${courseModule.language}` : ""}/play/${learner.course.team?.id}/courses/${learner.course.id}/certificate?learnerId=${learner.id}`;

			const t = await getTranslations({
				locale: courseModule?.language!,
				namespace: "Email",
			});

			const teamTranslation = translate(
				learner.course.team.translations,
				courseModule?.language
			);
			const courseTranslation = translate(
				learner.course.translations,
				courseModule?.language
			);

			const html = await renderAsync(
				React.createElement(CourseCompletion, {
					course: courseTranslation.name,
					organization: teamTranslation.name,
					href,
					text: {
						title: t("Completion.title"),
						congratulations: t("Completion.congratulations"),
						by: t("by"),
						certificate: t("Completion.certificate"),
						get: t("Completion.get"),
					},
				})
			);

			const { error } = await resend.emails.send({
				html,
				to: learner.email,
				subject: courseTranslation.name,
				from: `${teamTranslation.name} <noreply@lcds.krakconsultants.com>`,
				reply_to: `${teamTranslation.name} <noreply@${learner.course.team.customDomain ? learner.course.team.customDomain : "lcds.krakconsultants.com"}>`,
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

		const existingLearners = await db.query.learners.findMany({
			where: and(
				inArray(
					learners.courseId,
					courses.map((course) => course.id)
				),
				inArray(
					learners.email,
					learnerList.map((learner) => learner.email)
				)
			),
		});

		await db.insert(learners).values(learnerList).onConflictDoNothing();

		const emailList = learnerList
			.filter((learner) => learner.sendEmail !== false && learner.email)
			.map((learner) => {
				const course = courses.find(
					(course) => course.id === learner.courseId
				)!;
				return {
					email: learner.email,
					// If the learner already exists, use the existing learner id
					learnerId:
						existingLearners.find(
							(l) =>
								l.email === learner.email &&
								l.courseId === learner.courseId
						)?.id ?? learner.id,
					course,
					inviteLanguage: learner.inviteLanguage,
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
		inviteLanguage,
	}: {
		email: string;
		learnerId: string;
		course: Course & { translations: CourseTranslation[] };
		inviteLanguage?: Language;
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
				? `${team.customDomain}${inviteLanguage ? `/${inviteLanguage}` : ""}/courses/${course.id}/join?learnerId=${learnerId}`
				: `${env.NEXT_PUBLIC_SITE_URL}${inviteLanguage ? `/${inviteLanguage}` : ""}/play/${team?.id}/courses/${course.id}/join?learnerId=${learnerId}`;

		const t = await getTranslations({
			locale: inviteLanguage ?? "en",
			namespace: "Email",
		});

		const courseTranslation = translate(
			course.translations,
			inviteLanguage
		);
		const teamTranslation = translate(team.translations, inviteLanguage);

		const html = await renderAsync(
			React.createElement(LearnerInvite, {
				course: courseTranslation.name,
				organization: teamTranslation.name,
				href,
				text: {
					title: t("Invite.title"),
					invite: t("Invite.invite"),
					by: t("by"),
					start: t("Invite.start"),
				},
			})
		);

		const { data, error } = await resend.emails.send({
			html,
			to: email,
			subject: courseTranslation.name,
			from: `${teamTranslation.name} <noreply@lcds.krakconsultants.com>`,
			reply_to: `${teamTranslation.name} <noreply@${team.customDomain ? team.customDomain : "lcds.krakconsultants.com"}>`,
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
