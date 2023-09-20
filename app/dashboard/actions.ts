"use server";

import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import LearnerInvite from "@/emails/LearnerInvite";
import { env } from "@/env.mjs";
import { getAuth } from "@/lib/auth";
import { s3Client } from "@/lib/s3";
import { getInitialScormData } from "@/lib/scorm";
import { IMSManifestSchema } from "@/types/scorm/content";
import {
	DeleteObjectsCommand,
	ListObjectsCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import mime from "mime-types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
const zip = new JSZip();

const resend = new Resend(env.RESEND_API_KEY);

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
});

export const uploadCourse = async (formData: FormData) => {
	const { teamId } = getAuth();

	const courseZip = formData.get("file") as File | null;
	if (courseZip) {
		const courseUnzipped = await zip.loadAsync(courseZip.arrayBuffer());

		// validate imsmanifest.xml
		const manifestFile = courseUnzipped.file("imsmanifest.xml");

		if (!manifestFile) {
			throw new Error("imsmanifest.xml not found");
		}

		const manifestText = await manifestFile.async("text");

		const parsedIMSManifest = parser.parse(manifestText);
		const scorm = IMSManifestSchema.parse(parsedIMSManifest).manifest;
		const courseTitle = Array.isArray(scorm.organizations.organization)
			? scorm.organizations.organization[0].title
			: scorm.organizations.organization.title;

		const insertId = crypto.randomUUID();
		await db.insert(courses).values({
			id: insertId,
			teamId,
			name: courseTitle,
			version: `${scorm.metadata.schemaversion}`,
		});

		const files = courseUnzipped.folder(".")?.files;

		for (const relativePath in files) {
			const file = files[relativePath];
			const buffer = await file.async("nodebuffer");
			const type = mime.lookup(relativePath);

			await s3Client.send(
				new PutObjectCommand({
					Bucket: "krak-lms",
					Key: `courses/${insertId}/` + relativePath,
					ContentType: type ? type : undefined,
					Body: buffer,
				})
			);
		}
	}

	revalidatePath("/dashboard");
	redirect("/dashboard");
};

export const deleteCourse = async (courseId: string) => {
	console.log("Deleting course", courseId);

	const { teamId } = getAuth();

	// get all files in the course
	const courseFiles = await s3Client.send(
		new ListObjectsCommand({
			Bucket: "krak-lms",
			Prefix: `courses/${courseId}/`,
		})
	);

	console.log("Files", courseFiles.Contents?.length);

	// delete the files
	if (courseFiles.Contents) {
		const deleted = await s3Client.send(
			new DeleteObjectsCommand({
				Bucket: "krak-lms",
				Delete: {
					Objects: courseFiles.Contents.map((item) => ({
						Key: item.Key,
					})), // array of keys to be deleted
				},
			})
		);
		console.log("Deleted", deleted.Deleted?.length);
	} else {
		console.log("No files found");
	}

	// delete the course if it exists and the user owns it and is currently on the team
	await db
		.delete(courses)
		.where(and(eq(courses.id, courseId), eq(courses.teamId, teamId)));

	// Delete the course users
	await db.delete(learners).where(eq(learners.courseId, courseId));

	revalidatePath("/dashboard");
	redirect("/dashboard");
};

export const inviteLearner = async ({
	courseId,
	email,
}: {
	email: string;
	courseId: string;
}) => {
	const { teamId } = getAuth();

	const course = await db
		.select()
		.from(courses)
		.where(and(eq(courses.id, courseId), eq(courses.teamId, teamId)));

	if (course.length === 0) {
		throw new Error("Course not found");
	}

	const learner = await db
		.select()
		.from(learners)
		.where(and(eq(learners.email, email), eq(learners.courseId, courseId)));

	if (learner.length > 0) {
		throw new Error("Learner is already invited to this course");
	}

	const learnerId = crypto.randomUUID();

	await resend.emails.send({
		from: "support@billyhawkes.com",
		to: email,
		subject: course[0].name,
		react: LearnerInvite({
			email,
			course: course[0].name,
			organization: "Krak LMS",
			href: `${env.NEXT_PUBLIC_SITE_URL}/courses/${course[0].id}?learnerId=${learnerId}`,
		}),
	});

	await db.insert(learners).values({
		id: learnerId,
		courseId: course[0].id,
		email,
		data: getInitialScormData(course[0].version),
	});

	revalidatePath(`/dashboard/courses/${course[0].id}`);
};

export const deleteLearner = async ({
	learnerId,
	courseId,
}: {
	learnerId: string;
	courseId: string;
}) => {
	const { teamId } = getAuth();

	// Verify the user owns the course
	const course = await db
		.select()
		.from(courses)
		.where(and(eq(courses.id, courseId), eq(courses.teamId, teamId)));

	if (course.length === 0) {
		throw new Error("Course not found");
	}

	// Delete the course user
	await db
		.delete(learners)
		.where(
			and(eq(learners.id, learnerId), eq(learners.courseId, courseId))
		);

	revalidatePath(`/dashboard/courses/${courseId}`);
};

export const joinCourse = async ({
	email,
	courseId,
}: {
	email: string;
	courseId: string;
}) => {
	const learner = await db
		.select()
		.from(learners)
		.where(and(eq(learners.email, email), eq(learners.courseId, courseId)));

	if (learner.length > 0) {
		redirect(`/courses/${courseId}?learnerId=${learner[0].id}`);
	}

	const course = await db
		.select()
		.from(courses)
		.where(eq(courses.id, courseId));

	if (course.length === 0) {
		throw new Error("Course not found");
	}

	const learnerId = crypto.randomUUID();
	await db.insert(learners).values({
		id: learnerId,
		courseId: courseId,
		email: email === "" ? "Anonymous" : email,
		data: getInitialScormData(course[0].version),
	});

	redirect(`/courses/${courseId}?learnerId=${learnerId}`);
};
