import { GetObjectCommand } from "@aws-sdk/client-s3";
import Zip from "jszip";
import { s3Client } from "./s3";

const zip = new Zip();

// Get a course file from S3
export const getCourseFile = async (courseId: string, url: string) => {
	const courseZip = await s3Client.send(
		new GetObjectCommand({
			Bucket: "krak-lcds",
			Key: `courses/${courseId}`,
		})
	);
	const body = await courseZip.Body?.transformToByteArray();
	if (!body) return null;

	const course = await zip.loadAsync(body);
	return await course.file(url);
};
