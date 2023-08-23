import { S3Client } from "@aws-sdk/client-s3";

// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: "ca-central-1" });

export { s3Client };
