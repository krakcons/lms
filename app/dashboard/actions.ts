"use server";

import { db } from "@/lib/db/db";
import { courseUsers, courses } from "@/lib/db/schema";
import { s3Client } from "@/lib/s3";
import { getInitialScormData } from "@/lib/scorm";
import { Course } from "@/types/course";
import { IMSManifestSchema } from "@/types/scorm/content";
import {
	DeleteObjectsCommand,
	ListObjectsCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import mime from "mime-types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const zip = new JSZip();

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
});

export const uploadCourse = async (formData: FormData) => {
	const userId = auth().userId;

	if (!userId) {
		throw new Error("User not logged in");
	}

	const courseZip = formData.get("file") as File | null;
	if (courseZip) {
		const courseUnzipped = await zip.loadAsync(courseZip.arrayBuffer());

		// validate imsmanifest.xml
		const manifest = courseUnzipped.file("imsmanifest.xml");

		if (!manifest) {
			throw new Error("imsmanifest.xml not found");
		}

		const manifestText = await manifest.async("text");

		// Check if file exists
		const userCourses = await s3Client.send(
			new ListObjectsCommand({
				Bucket: "krak-lms",
				Prefix: `courses/${userId}/`,
				Delimiter: "/",
			})
		);
		userCourses.CommonPrefixes?.forEach((prefix) => {
			if (prefix.Prefix?.includes(courseZip.name.replace(".zip", ""))) {
				throw new Error("Course already exists");
			}
		});

		const parsedIMSManifest = parser.parse(manifestText).manifest;
		const scorm = IMSManifestSchema.parse(parsedIMSManifest);
		const courseTitle = Array.isArray(scorm.organizations.organization)
			? scorm.organizations.organization[0].title
			: scorm.organizations.organization.title;

		const insertId = crypto.randomUUID();
		const newCourse = await db.insert(courses).values({
			id: insertId,
			userId,
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

	const userId = auth().userId;

	if (!userId) {
		throw new Error("User not logged in");
	}

	console.log(userId);

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

	// delete the course
	await db.delete(courses).where(eq(courses.id, courseId));

	revalidatePath("/dashboard");
	redirect("/dashboard");
};

export const inviteUser = async ({
	courseId,
	email,
	version,
}: {
	courseId: string;
	email: string;
	version: Course["version"];
}) => {
	const res = await db.insert(courseUsers).values({
		id: crypto.randomUUID(),
		courseId: courseId,
		email,
		data: getInitialScormData(version),
	});

	if (res.insertId) {
		// Send email
	} else {
		throw new Error("Failed to create course user");
	}

	revalidatePath(`/dashboard/courses/${courseId}`);
};
