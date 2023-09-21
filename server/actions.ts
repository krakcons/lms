"use server";

import { serverTrpc } from "@/app/_trpc/server";
import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { s3Client } from "@/lib/s3";
import { DeleteCourse } from "@/types/course";
import { IMSManifestSchema } from "@/types/scorm/content";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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
	const { teamId } = getAuth();

	if (!teamId) {
		throw new Error("Team ID not found");
	}

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

export const deleteCourse = async (input: DeleteCourse) => {
	await serverTrpc.course.delete(input);

	revalidatePath("/dashboard");
	redirect("/dashboard");
};
