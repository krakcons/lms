import { s3Client } from "@/libs/s3";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs";
import Link from "next/link";

type Props = {};

const Page = async ({}: Props) => {
	const { userId } = auth();

	if (!userId) return null;

	const res = await s3Client.send(
		new ListObjectsCommand({
			Bucket: "krak-lms",
			Prefix: "courses/" + `${userId}/`,
			Delimiter: "/",
		})
	);

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h1 className="text-2xl sm:text-4xl">Courses</h1>
				<Link href="/dashboard/upload" className="btn">
					Upload
				</Link>
			</div>
			<div className="flex flex-col">
				{res.CommonPrefixes?.map(
					(prefix, index) =>
						prefix.Prefix && (
							<Link
								key={index}
								href={prefix.Prefix}
								className="group mb-4 bg-elevation-2 p-6 text-sm transition-colors hover:bg-elevation-3"
							>
								{prefix.Prefix.replace("courses", "")
									.replaceAll("/", "")
									.replace(userId, "")}
							</Link>
						)
				)}
			</div>
		</>
	);
};

export default Page;
