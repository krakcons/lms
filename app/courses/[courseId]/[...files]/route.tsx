import { getCourseFile } from "@/lib/s3";
import mime from "mime-types";

export const GET = async (
	_: Request,
	{
		params: { files, courseId },
	}: {
		params: { files: string[]; courseId: string; userId: string };
	}
) => {
	let url = files.join("/");

	if (url === "scormcontent/0") {
		url = "scormcontent/index.html";
	}

	const file = await getCourseFile(courseId, url);

	if (!file) {
		return new Response("Not found", {
			status: 404,
		});
	}

	const fileBody = await file.async("uint8array");
	const contentType = mime.lookup(url);

	return new Response(fileBody, {
		status: 200,
		headers: {
			"Content-Type": contentType ? contentType : "text/html",
		},
	});
};
