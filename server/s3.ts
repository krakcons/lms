import { env } from "@/env.mjs";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
	region: "auto",
	endpoint: env.R2_ENDPOINT,
	credentials: {
		accessKeyId: env.R2_KEY_ID,
		secretAccessKey: env.R2_SECRET,
	},
});
