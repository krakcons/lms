import { env } from "@/env.mjs";
import { s3Client } from "@/libs/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { NextResponse } from "next/server";

export const GET = async (
	request: Request,
	{ params: { files, id } }: { params: { files: string[]; id: string } }
) => {
	const url = files.join("/");

	const file = await s3Client.send(
		new GetObjectCommand({
			Bucket: "krak-lms",
			Key: `packages/${id}/${url}`,
		})
	);
	const body = (await file.Body) as ReadableStream<Uint8Array>;

	console.log(file.ContentType);

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": file.ContentType ?? "text/html",
		},
	});
};
