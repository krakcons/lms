import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { s3Client } from "@/lib/s3";
import { IMSManifestSchema } from "@/types/scorm/content";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import mime from "mime-types";
import { NextResponse } from "next/server";
import { z } from "zod";
const zip = new JSZip();

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
});

const validateCourse = async (req: Request) => {
	let course: JSZip;
	try {
		const formData = await req.formData();
		const courseZip = z.custom<File>().parse(formData.get("file"));
		course = await zip.loadAsync(courseZip.arrayBuffer());
	} catch (err) {
		throw {
			code: "BAD_REQUEST",
			message:
				"Could not parse course file. Ensure it is a zip file and exists in form data as 'file'.",
		};
	}

	// validate imsmanifest.xml exists
	const manifestFile = course.file("imsmanifest.xml");
	if (!manifestFile) {
		throw {
			code: "BAD_REQUEST",
			message: "Course is missing imsmanifest.xml",
		};
	}

	// validate imsmanifest.xml is valid scorm content
	const manifestText = await manifestFile.async("text");
	const IMSManifest = parser.parse(manifestText);

	const manifest = IMSManifestSchema.safeParse(IMSManifest);
	if (!manifest.success) {
		throw {
			code: "BAD_REQUEST",
			message: manifest.error.issues[0].message,
		};
	}

	return { manifest: manifest.data.manifest, file: course };
};

export const POST = async (req: Request) => {
	const { teamId } = getAuth();

	// Validate course
	let course: Awaited<ReturnType<typeof validateCourse>>;
	try {
		course = await validateCourse(req);
	} catch (err) {
		return NextResponse.json(err, { status: 400 });
	}
	const { manifest, file } = course;

	const insertId = crypto.randomUUID();

	// Upload course to S3
	const files = file.folder(".")?.files;
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

	// Insert course into database if successfully uploaded to S3
	await db.insert(courses).values({
		id: insertId,
		teamId,
		name: Array.isArray(manifest.organizations.organization)
			? manifest.organizations.organization[0].title
			: manifest.organizations.organization.title,
		version: `${manifest.metadata.schemaversion}`,
	});

	return NextResponse.json({ message: "Uploaded course!" });
};
