"use server";

import { env } from "@/env.mjs";
import { getInitialScormData } from "@/lib/scorm";
import { db } from "@/server/db/db";
import { courses, learners } from "@/server/db/schema";
import { svix } from "@/server/svix";
import {
	DeleteCourseSchema,
	SelectCourseSchema,
	UpdateCourseSchema,
	UploadCourseSchema,
} from "@/types/course";
import {
	CreateLearnerSchema,
	DeleteLearnerSchema,
	ExtendLearner,
	LearnerSchema,
	SelectLearnerSchema,
	UpdateLearnerSchema,
} from "@/types/learner";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { action, authAction } from "./client";
import { deleteFolder } from "./s3";

const InviteEmail = ({
	href,
	email,
	course,
	organization,
}: {
	email: string;
	href: string;
	course: string;
	organization: string;
}) => {
	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html lang="en"><head data-id="__react-email-head"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head><div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Join this course<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div></div><body data-id="__react-email-body" style="margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:rgb(255,255,255);font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji"><table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;margin-left:auto;margin-right:auto;margin-top:40px;margin-bottom:40px;width:465px;border-radius:0.25rem;border-width:1px;border-style:solid;border-color:rgb(234,234,234);padding:20px"><tbody><tr style="width:100%"><td><h1 data-id="react-email-heading">Course Invitation</h1><p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:16px 0">Hello <strong>${email}</strong>,</p><p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:16px 0">You have been invited to join <strong>${course}</strong> by <strong>${organization}</strong>.</p><a href="${href}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color:rgb(0,0,0);text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Start Course</span><span></span></a></td></tr></tbody></table></body></html>`;
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
						href: `${env.NEXT_PUBLIC_SITE_URL}/play/${course.id}?learnerId=${newLearner.id}`,
					}),
				}),
			});

			if (!res.ok) {
				throw new Error(
					"Failed to send email, no user created. Please try again later or remove the sendEmail option."
				);
			}
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

export const getCourse = authAction(
	SelectCourseSchema,
	async ({ id }, { user }) => {
		const course = await db.query.courses.findFirst({
			where: and(eq(courses.id, id), eq(courses.userId, user.id)),
			with: {
				learners: true,
			},
		});

		if (!course) {
			throw new Error("Course not found or does not belong to you");
		}

		return course;
	}
);

export const getCourses = authAction(z.undefined(), async (_, { user }) => {
	return await db.query.courses.findMany({
		where: eq(courses.userId, user.id),
	});
});

export const deleteCourse = authAction(
	DeleteCourseSchema,
	async ({ id }, { user }) => {
		await db
			.delete(courses)
			.where(and(eq(courses.id, id), eq(courses.userId, user.id)));
		await db.delete(learners).where(eq(learners.courseId, id));
		await deleteFolder(`courses/${id}`);

		return undefined;
	}
);

export const updateCourse = authAction(
	UpdateCourseSchema,
	async ({ id, ...rest }, { user }) => {
		await db
			.update(courses)
			.set({ ...rest })
			.where(and(eq(courses.id, id), eq(courses.userId, user.id)));
	}
);

export const uploadCourse = authAction(
	UploadCourseSchema,
	async ({ name, version, id }, { user }) => {
		if (id === "") {
			id = undefined;
		}

		if (id) {
			const course = await db.query.courses.findFirst({
				where: and(eq(courses.id, id)),
			});
			if (course) {
				throw new Error("Course already exists with that identifier");
			}
		}

		const insertId = id ?? crypto.randomUUID();

		// Create a new course and svix app
		await db.insert(courses).values({
			id: insertId,
			userId: user.id,
			name,
			version,
		});

		await svix.application.create({
			name: `app_${insertId}`,
			uid: `app_${insertId}`,
		});

		return {
			courseId: insertId,
		};
	}
);
