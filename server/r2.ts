import { env } from "@/env";
import { AwsClient } from "aws4fetch";
import { XMLParser } from "fast-xml-parser";

export const r2 = new AwsClient({
	accessKeyId: env.R2_KEY_ID,
	secretAccessKey: env.R2_SECRET,
	region: "auto",
});

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
});

export const getPresignedUrl = async (key: string) => {
	const res = await r2.sign(`${env.NEXT_PUBLIC_SITE_URL}/r2/${key}`, {
		method: "PUT",
		aws: {
			signQuery: true,
		},
	});

	return res.url;
};

export const deleteFolder = async (prefix: string) => {
	let nextContinuationToken = null;
	do {
		const res = await r2.fetch(
			`${env.NEXT_PUBLIC_SITE_URL}/r2?list-type=2&prefix=${prefix}${nextContinuationToken ? `&continuation-token=${nextContinuationToken}` : ""}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			}
		);
		const text = await res.text();
		const listObjectsData = parser.parse(text);

		// Delete each object
		const deletePromises = listObjectsData?.ListBucketResult?.Contents?.map(
			(obj: any) => {
				return r2.fetch(`${env.NEXT_PUBLIC_SITE_URL}/r2/${obj.Key}`, {
					method: "DELETE",
				});
			}
		);

		if (deletePromises) await Promise.all(deletePromises);

		// Check for pagination
		nextContinuationToken = listObjectsData.NextContinuationToken;
	} while (nextContinuationToken);

	console.log("All objects under prefix", prefix, "have been deleted.");
};
