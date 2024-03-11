import { s3 } from "@/server/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import JSZip from "jszip";
import mime from "mime-types";

export const GET = async (
	_: Request,
	{
		params: { files, courseId },
	}: {
		params: { files: string[]; courseId: string };
	}
) => {
	let url = files.join("/");

	if (url === "scormcontent/0") {
		url = "scormcontent/index.html";
	}

	const courseZip = await s3.send(
		new GetObjectCommand({
			Bucket: "krak-lcds",
			Key: `courses/${courseId}`,
		})
	);

	const body = await courseZip.Body?.transformToByteArray();
	if (!body) {
		return new Response("File Not found", {
			status: 404,
		});
	}
	const course = await JSZip.loadAsync(body);

	const file = course.file(url);
	const contentType = mime.lookup(url);

	if (!file) {
		return new Response("File Not found", {
			status: 404,
		});
	}

	return new Response(await file.async("uint8array"), {
		status: 200,
		headers: {
			"Content-Type": contentType ? contentType : "text/html",
		},
	});
};
