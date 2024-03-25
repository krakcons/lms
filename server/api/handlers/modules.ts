import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { getInitialScormData } from "@/lib/scorm";
import { deleteFolder } from "@/server/actions/s3";
import { db } from "@/server/db/db";
import { learnersData } from "@/server/db/learners";
import { modulesData } from "@/server/db/modules";
import { learners, modules } from "@/server/db/schema";
import { resend } from "@/server/resend";
import { CreateLearnerSchema, ExtendLearner } from "@/types/learner";
import { zValidator } from "@hono/zod-validator";
import { renderAsync } from "@react-email/components";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import React from "react";
import { authedMiddleware } from "../middleware";

export const modulesHandler = new Hono()
	.get("/:id", async (c) => {
		const { id } = c.req.param();

		const learner = await learnersData.get({ id });

		return c.json(learner);
	})
	.get("/:id/learners", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const user = c.get("user");

		const learners = await modulesData.getLearners({ id }, user.id);

		return c.json(learners);
	})
	.post(
		"/:id/learners",
		zValidator(
			"json",
			CreateLearnerSchema.omit({
				moduleId: true,
			})
		),
		async (c) => {
			const { id } = c.req.param();
			const { email, sendEmail, id: learnerId } = c.req.valid("json");

			const courseModule = await db.query.modules.findFirst({
				where: and(eq(modules.id, id)),
				with: {
					course: true,
				},
			});

			if (!courseModule) {
				throw new HTTPException(401, {
					message: "Module not found",
				});
			}

			// Create a new learner
			const newLearner = {
				id: learnerId ?? crypto.randomUUID(),
				moduleId: courseModule.id,
				email: email ? email : null,
				data: getInitialScormData(courseModule.type),
				contentType: courseModule.type,
			};

			if (sendEmail && email) {
				const html = await renderAsync(
					React.createElement(LearnerInvite, {
						email,
						course: courseModule.course.name,
						organization: "Krak LMS",
						href: `${env.NEXT_PUBLIC_SITE_URL}/play/${courseModule.course.id}?learnerId=${id}`,
					})
				);
				await resend.emails.send({
					html,
					to: email,
					subject: courseModule.course.name,
					from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
				});
			}

			await db.insert(learners).values(newLearner).onConflictDoNothing();

			return c.json(ExtendLearner(courseModule.type).parse(newLearner));
		}
	)
	.delete("/:id", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const user = c.get("user");

		const courseModule = await modulesData.get({ id }, user.id);

		await db
			.delete(modules)
			.where(
				and(
					eq(modules.id, courseModule.id),
					eq(modules.userId, user.id)
				)
			);

		await db.delete(learners).where(eq(learners.moduleId, courseModule.id));

		await deleteFolder(
			`courses/${courseModule.courseId}/${courseModule.language}`
		);

		return c.json(null);
	});
