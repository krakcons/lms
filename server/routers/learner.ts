import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import { env } from "@/env.mjs";
import { getInitialScormData } from "@/lib/scorm";
import {
	CreateLearnerSchema,
	DeleteLearnerSchema,
	LearnerSchema,
	SelectLearner,
	SelectLearnerSchema,
	UpdateLearnerSchema,
} from "@/types/learner";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { getCourse } from "../helpers";
import { protectedProcedure } from "../procedures";
import { publicProcedure, router } from "../trpc";

interface Email {
	email: string;
	href: string;
	course: string;
	organization: string;
}

const InviteEmail = ({ href, email, course, organization }: Email) => {
	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html lang="en"><head data-id="__react-email-head"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head><div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Join this course<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div></div><body data-id="__react-email-body" style="margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:rgb(255,255,255);font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji"><table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;margin-left:auto;margin-right:auto;margin-top:40px;margin-bottom:40px;width:465px;border-radius:0.25rem;border-width:1px;border-style:solid;border-color:rgb(234,234,234);padding:20px"><tbody><tr style="width:100%"><td><h1 data-id="react-email-heading">Course Invitation</h1><p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:16px 0">Hello <strong>${email}</strong>,</p><p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:16px 0">You have been invited to join <strong>${course}</strong> by <strong>${organization}</strong>.</p><a href="${href}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color:rgb(0,0,0);text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Start Course</span><span></span></a></td></tr></tbody></table></body></html>`;
};

const getLearner = async ({ id, courseId }: SelectLearner) => {
	const learner = await db.query.learners.findFirst({
		where: and(eq(learners.id, id), eq(learners.courseId, courseId)),
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

	return learner;
};

export const learnerRouter = router({
	create: publicProcedure
		.meta({
			openapi: {
				summary: "Create learner",
				method: "POST",
				path: "/courses/{courseId}/learners",
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
				const res = await fetch("https://api.resend.com/emails", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${env.RESEND_API_KEY}`,
					},
					body: JSON.stringify({
						from: "Krak LCDS <noreply@lcds.krakconsultants.com>",
						to: email,
						subject: course.name,
						html: InviteEmail({
							email,
							course: course.name,
							organization: "Krak LMS",
							href: `${env.NEXT_PUBLIC_SITE_URL}/courses/${course.id}?learnerId=${newLearner.id}`,
						}),
					}),
				});

				if (!res.ok) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							"Failed to send email, no user created. Please try again later or remove the sendEmail option.",
					});
				}
			}

			await db.insert(learners).values(newLearner);

			return newLearner;
		}),
	findOne: publicProcedure
		.meta({
			openapi: {
				summary: "Get learner by ID",
				method: "GET",
				path: "/courses/{courseId}/learners/{id}",
			},
		})
		.input(SelectLearnerSchema)
		.output(LearnerSchema)
		.query(async ({ input }) => {
			const learner = await getLearner(input);
			console.log(learner);
			return learner;
		}),
	find: protectedProcedure
		.meta({
			openapi: {
				summary: "Get all learners",
				method: "GET",
				path: "/courses/{courseId}/learners",
				protect: true,
			},
		})
		.input(LearnerSchema.pick({ courseId: true }))
		.output(LearnerSchema.array())
		.query(async ({ ctx: { teamId }, input: { courseId } }) => {
			await getCourse({ id: courseId, teamId });

			return await db.query.learners.findMany({
				where: eq(learners.courseId, courseId),
			});
		}),
	update: publicProcedure
		.meta({
			openapi: {
				summary: "Update learner",
				method: "PUT",
				path: "/courses/{courseId}/learners/{id}",
			},
		})
		.input(UpdateLearnerSchema)
		.output(LearnerSchema)
		.mutation(async ({ input: { id, courseId, ...rest } }) => {
			const learner = await getLearner({ id, courseId });

			await db
				.update(learners)
				.set({ ...rest })
				.where(
					and(eq(learners.courseId, courseId), eq(learners.id, id))
				);

			return {
				...learner,
				...rest,
			};
		}),
	delete: publicProcedure
		.meta({
			openapi: {
				summary: "Delete learner",
				method: "DELETE",
				path: "/courses/{courseId}/learners/{id}",
			},
		})
		.input(DeleteLearnerSchema)
		.output(LearnerSchema)
		.mutation(async ({ input }) => {
			const learner = await getLearner(input);

			await db
				.delete(learners)
				.where(
					and(
						eq(learners.id, input.id),
						eq(learners.courseId, input.courseId)
					)
				);

			return learner;
		}),
});
