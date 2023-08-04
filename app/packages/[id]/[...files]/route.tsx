import { s3Client } from "@/libs/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const GET = async (
	request: Request,
	{
		params: { files, id },
	}: {
		params: { files: string[]; id: string };
	}
) => {
	const url = files.join("/");

	const file = await s3Client.send(
		new GetObjectCommand({
			Bucket: "krak-lms",
			Key: `packages/${id}/${url}`,
		})
	);
	const body = (await file.Body) as ReadableStream<Uint8Array>;

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": file.ContentType ?? "text/html",
		},
	});
};
