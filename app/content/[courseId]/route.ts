import { env } from "@/env.mjs";
import { MAX_FILE_SIZE } from "@/lib/course";
import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (
	_: Request,
	{
		params: { courseId },
	}: {
		params: { courseId: string };
	}
) => {
	const presignedUrl = await createPresignedPost(s3Client as any, {
		Bucket: "krak-lcds",
		Key: `courses/${courseId}`,
		Fields: {
			key: `courses/${courseId}`,
		},
		Conditions: [
			["eq", "$Content-Type", "application/zip"],
			["content-length-range", 0, MAX_FILE_SIZE],
		],
	});
	return NextResponse.json(presignedUrl);
};

export const DELETE = async (
	_: Request,
	{
		params: { courseId },
	}: {
		params: { courseId: string };
	}
) => {
	const headersList = headers();

	if (
		headersList.get("AWS_SECRET_ACCESS_KEY") !== env.AWS_SECRET_ACCESS_KEY
	) {
		return new Response(null, { status: 401 });
	}

	if (!courseId) return new Response(null, { status: 404 });

	await s3Client.send(
		new DeleteObjectCommand({
			Bucket: "krak-lcds",
			Key: `courses/${courseId}`,
		})
	);

	return NextResponse.json({});
};
