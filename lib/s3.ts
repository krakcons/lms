import { env } from "@/env.mjs";
import { S3Client } from "@aws-sdk/client-s3";

// Create an Amazon S3 service client object.
export const s3Client = new S3Client({
	region: "ca-central-1",
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
});
