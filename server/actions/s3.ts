"use server";

import {
	DeleteObjectCommand,
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
		console.log(obj.Key);
		return s3.send(
			new DeleteObjectCommand({
				Bucket: "krak-lcds",
				Key: obj.Key,
			})
		);
	});

	if (deletePromises) await Promise.all(deletePromises);
};
