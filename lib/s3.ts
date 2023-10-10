import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Zip from "jszip";
const zip = new Zip();

// Create an Amazon S3 service client object.
export const s3Client = new S3Client({ region: "us-east-2" });

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
