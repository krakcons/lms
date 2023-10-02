import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { getInitialScormData } from "@/lib/scorm";
import {
	CreateLearnerSchema,
	DeleteLearnerSchema,
	LearnerSchema,
} from "@/types/learner";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { protectedProcedure } from "../procedures";
import { resend } from "../resend";
import { publicProcedure, router } from "../trpc";

export const learnerRouter = router({
	update: publicProcedure
		.meta({
			openapi: {
				summary: "Update learner",
				method: "PUT",
				path: "/learners/{id}",
			},
		})
		.input(LearnerSchema)
		.output(LearnerSchema)
		.mutation(async ({ input: learner }) => {
			await db
				.update(learners)
				.set({ ...learner })
				.where(
					and(
						eq(learners.courseId, learner.courseId),
						eq(learners.id, learner.id)
					)
				);

			return learner;
		}),
	delete: protectedProcedure
		.meta({
			openapi: {
				summary: "Delete learner",
				method: "DELETE",
				path: "/learners/{id}",
				protect: true,
			},
		})
		.input(DeleteLearnerSchema)
		.output(LearnerSchema)
		.mutation(async ({ ctx: { teamId }, input: { id } }) => {
			const learner = await db.query.learners.findFirst({
				where: eq(learners.id, id),
				with: {
					course: true,
				},
			});

			if (!learner) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Learner not found",
				});
			}

			if (learner.course.teamId !== teamId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Course this learner belongs to does not belong to current team",
				});
			}

			await db.delete(learners).where(eq(learners.id, id));

			return learner;
		}),
	create: publicProcedure
		.meta({
			openapi: {
				summary: "Create learner",
				method: "POST",
				path: "/learners",
			},
		})
		.input(CreateLearnerSchema)
		.output(LearnerSchema)
		.mutation(async ({ input: { email, sendEmail = false, courseId } }) => {
			// Check if learner already exists by email
			if (email) {
				const learner = await db.query.learners.findFirst({
					where: and(
						eq(learners.email, email),
						eq(learners.courseId, courseId)
					),
				});

				if (learner) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Learner is already a member of this course",
					});
				}
			}

			const course = await db.query.courses.findFirst({
				where: eq(courses.id, courseId),
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Course not found",
				});
			}

			// Create a new learner
			const newLearner = {
				id: crypto.randomUUID(),
				courseId: course.id,
				email,
				data: getInitialScormData(course.version) ?? {},
			};

			if (sendEmail && email) {
				await resend.emails.send({
					from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
					to: email,
					subject: course.name,
					react: LearnerInvite({
						email,
						course: course.name,
						organization: "Krak LMS",
						href: `${env.NEXT_PUBLIC_SITE_URL}/courses/${course.id}?learnerId=${newLearner.id}`,
					}),
				});
			}

			await db.insert(learners).values(newLearner);

			return newLearner;
		}),
});
