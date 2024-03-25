"use server";

import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../s3";

export const getPresignedUrl = async (Key: string) => {
	return await getSignedUrl(
		s3,
		new PutObjectCommand({ Bucket: "krak-lcds", Key }),
		{ expiresIn: 3600 }
	);
};

export const deleteFolder = async (Prefix: string) => {
	const data = await s3.send(
		new ListObjectsV2Command({
			Bucket: "krak-lcds",
			Prefix,
		})
	);

	// Delete each object
	const deletePromises = data.Contents?.map((obj) => {
		return s3.send(
			new DeleteObjectCommand({
				Bucket: "krak-lcds",
				Key: obj.Key,
			})
		);
	});

	if (deletePromises) await Promise.all(deletePromises);
};

// Get a course file from S3
export const getCourseFile = async (url: string) => {
	const courseZip = await s3.send(
		new GetObjectCommand({
			Bucket: "krak-lcds",
			Key: `courses/${url}`,
		})
	);
	const body = await courseZip.Body?.transformToByteArray();
	if (!body) return null;
	return body;
};
