"use server";

import { s3Client } from "@/libs/s3";
import { ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs";
import JSZip from "jszip";
import mime from "mime-types";
const zip = new JSZip();

export const uploadCourse = async (formData: FormData) => {
	const userid = auth().userId;

	if (!userid) {
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

		// Check if file exists
		const userCourses = await s3Client.send(
			new ListObjectsCommand({
				Bucket: "krak-lms",
				Prefix: "courses/" + `${userid}/`,
				Delimiter: "/",
			})
		);
		userCourses.CommonPrefixes?.forEach((prefix) => {
			if (prefix.Prefix?.includes(courseZip.name.replace(".zip", ""))) {
				throw new Error("Course already exists");
			}
		});

		const files = courseUnzipped.folder(".")?.files;

		for (const relativePath in files) {
			const file = files[relativePath];
			const buffer = await file.async("nodebuffer");
			const type = mime.lookup(relativePath);

			await s3Client.send(
				new PutObjectCommand({
					Bucket: "krak-lms",
					Key:
						"courses/" +
						`${userid}/` +
						`${courseZip.name.replace(".zip", "")}/` +
						relativePath,
					ContentType: type ? type : undefined,
					Body: buffer,
				})
			);
			console.log(
				"Uploaded " +
					"courses/" +
					`${userid}/` +
					`${courseZip.name.replace(".zip", "")}/` +
					relativePath
			);
		}
	}
};
