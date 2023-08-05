import { s3Client } from "@/libs/s3";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
import Link from "next/link";

type Props = {};

const Page = async ({}: Props) => {
	const res = await s3Client.send(
		new ListObjectsCommand({
			Bucket: "krak-lms",
			Prefix: "packages/",
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
								className="bg-elevation-2 p-6 mb-4 text-sm"
							>
								{prefix.Prefix.replace("packages", "").replaceAll("/", "")}
							</Link>
						)
				)}
			</div>
		</>
	);
};

export default Page;
