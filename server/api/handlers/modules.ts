import { getInitialScormData } from "@/lib/scorm";
import { coursesData } from "@/server/db/courses";
import { db } from "@/server/db/db";
import { learnersData } from "@/server/db/learners";
import { modulesData } from "@/server/db/modules";
import { learners, modules } from "@/server/db/schema";
import { deleteFolder } from "@/server/r2";
import { CreateLearnerSchema, ExtendLearner } from "@/types/learner";
import { UploadModuleSchema } from "@/types/module";
import { zValidator } from "@hono/zod-validator";
import { and, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { generateId } from "lucia";
import { authedMiddleware } from "../middleware";

export const modulesHandler = new Hono()
	.get("/:id", async (c) => {
		const { id } = c.req.param();

		const learner = await learnersData.get({ id });

		return c.json(learner);
	})
	.get("/:id/learners", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const teamId = c.get("teamId");

		const learners = await modulesData.getLearners({ id }, teamId);

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
			const learner = c.req.valid("json");

			const courseModule = await db.query.modules.findFirst({
				where: and(eq(modules.id, id)),
				with: {
					course: {
						with: {
							translations: true,
						},
					},
				},
			});

			if (!courseModule) {
				throw new HTTPException(401, {
					message: "Module not found",
				});
			}

			// Create a new learner
			const newLearner = {
				...learner,
				id: learner.id ?? generateId(32),
				moduleId: courseModule.id,
				courseId: courseModule.courseId,
				data: getInitialScormData(courseModule.type),
				startedAt: new Date(),
				completedAt: null,
			};

			const createdLearner = await db
				.insert(learners)
				.values(newLearner)
				.onConflictDoUpdate({
					target: [learners.email, learners.courseId],
					set: {
						moduleId: newLearner.moduleId,
						data: newLearner.data,
						startedAt: newLearner.startedAt,
					},
				})
				.returning();

			if (learner.sendEmail !== false && learner.email) {
				await learnersData.courseInvite({
					email: newLearner.email,
					learnerId: newLearner.id,
					course: courseModule.course,
					inviteLanguage: newLearner.inviteLanguage,
				});
			}

			return c.json(
				ExtendLearner(courseModule.type).parse(createdLearner[0])
			);
		}
	)
	.delete("/:id", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const teamId = c.get("teamId");

		const courseModule = await modulesData.get({ id });

		await coursesData.get({ id: courseModule.courseId }, teamId);

		await db.delete(modules).where(and(eq(modules.id, courseModule.id)));

		await db.delete(learners).where(eq(learners.moduleId, courseModule.id));

		await deleteFolder(
			`${teamId}/courses/${courseModule.courseId}/${courseModule.language}`
		);

		return c.json(null);
	})
	.post(
		"/",
		zValidator("json", UploadModuleSchema),
		authedMiddleware,
		async (c) => {
			let { type, id, courseId, language } = c.req.valid("json");
			const teamId = c.get("teamId");

			if (id === "") {
				id = undefined;
			}

			await coursesData.get({ id: courseId }, teamId);

			const languageWhere = and(
				eq(modules.courseId, courseId),
				eq(modules.language, language)
			);
			const where = id
				? or(eq(modules.id, id), languageWhere)
				: languageWhere;
			const courseModule = await db.query.modules.findFirst({
				where,
			});
			if (courseModule) {
				throw new HTTPException(409, {
					message: "Module already exists with that id or language",
				});
			}

			const insertId = id ?? generateId(15);

			await db.insert(modules).values({
				id: insertId,
				courseId,
				type,
				language,
			});

			return c.json({ id: insertId });
		}
	);
