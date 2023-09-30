import { IMSManifestSchema } from "@/types/scorm/content";
import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import { z } from "zod";

const zip = new JSZip();

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
});

export const validateCourse = async (file: File, ctx: z.RefinementCtx) => {
	console.log("validating", file.name);
	const fileBuffer = await file.arrayBuffer();
	const course = await zip.loadAsync(fileBuffer);

	// validate imsmanifest.xml exists
	const manifestFile = course.file("imsmanifest.xml");
	console.log("FILE NAME", manifestFile?.name);
	if (!manifestFile) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "imsmanifest.xml does not exist",
			fatal: true,
		});
		return z.NEVER;
	}

	// validate imsmanifest.xml is valid scorm content
	const manifestText = await manifestFile.async("text");
	const IMSManifest = parser.parse(manifestText);

	const manifest = IMSManifestSchema.safeParse(IMSManifest);
	if (!manifest.success) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: manifest.error.issues[0].message,
			fatal: true,
		});
		return z.NEVER;
	}

	return manifest.data.manifest;
};

export const CourseFile = z
	.custom<File>((val) => val instanceof File, "Please upload a file")
	.superRefine(async (file, ctx) => {
		return await validateCourse(file, ctx);
	});
export type CourseFile = z.infer<typeof CourseFile>;

export const CourseUpload = CourseFile.transform(async (file, ctx) => {
	const scorm = await validateCourse(file, ctx);

	return {
		...file,
		name: Array.isArray(scorm.organizations.organization)
			? scorm.organizations.organization[0].title
			: scorm.organizations.organization.title,
		version: scorm.metadata.schemaversion,
	};
});
