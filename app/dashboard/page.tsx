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
			<div className="flex w-full justify-between items-center mb-12">
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
								className="bg-elevation-2 p-6 mb-4 text-sm hover:bg-elevation-3 transition-colors"
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
