import { getCourseFile } from "@/server/actions/s3";
import mime from "mime-types";

export const GET = async (
	_: Request,
	{
		params: { files },
	}: {
		params: { files: string[] };
	}
) => {
	let url = files.join("/");

	console.log("URL", url);

	if (url === "scormcontent/0") {
		url = "scormcontent/index.html";
	}

	const fileBody = await getCourseFile(url);

	if (!fileBody) {
		return new Response("Not found", {
			status: 404,
		});
	}

	const contentType = mime.lookup(url);

	return new Response(fileBody, {
		status: 200,
		headers: {
			"Content-Type": contentType ? contentType : "text/html",
		},
	});
};
