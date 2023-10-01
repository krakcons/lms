import { UploadCourse } from "@/types/course";
import { IMSManifestSchema } from "@/types/scorm/content";
import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import { z } from "zod";

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
});

export const validateCourse = async (file: File, ctx: z.RefinementCtx) => {
	const zip = new JSZip();

	const fileBuffer = await file.arrayBuffer();
	const course = await zip.loadAsync(fileBuffer);

	// validate imsmanifest.xml exists
	const manifestFile = course.file("imsmanifest.xml");
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

	const scorm = manifest.data.manifest;

	return {
		file,
		upload: {
			name: Array.isArray(scorm.organizations.organization)
				? scorm.organizations.organization[0].title
				: scorm.organizations.organization.title,
			version:
				scorm.metadata.schemaversion.toString() as UploadCourse["version"],
		},
	};
};

export const FileSchema = z.custom<File>((val) => val instanceof File);

export const CourseFileSchema = FileSchema.superRefine(async (file, ctx) => {
	return await validateCourse(file, ctx);
});
export type CourseFile = z.infer<typeof CourseFileSchema>;

export const CourseUploadSchema = FileSchema.transform(async (file, ctx) => {
	return await validateCourse(file, ctx);
});
export type CourseUpload = z.infer<typeof CourseUploadSchema>;
