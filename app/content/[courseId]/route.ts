import { MAX_FILE_SIZE } from "@/lib/course";
import { s3Client } from "@/lib/s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
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
