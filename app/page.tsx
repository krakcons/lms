import { s3Client } from "@/libs/s3";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import Link from "next/link";

const Home = async () => {
	const res = await s3Client.send(
		new ListObjectsCommand({
			Bucket: "krak-lms",
			Prefix: "packages/",
			Delimiter: "/",
		})
	);
	console.log(res.CommonPrefixes?.map);

	return (
		<main className="bg-slate-900">
			<div className="flex flex-col items-center justify-center min-h-screen py-2">
				<h1 className="text-6xl font-bold text-white">Test packages</h1>
				<div className="flex mt-8">
					{res.CommonPrefixes?.map(
						(prefix, index) =>
							prefix.Prefix && (
								<Link
									key={index}
									href={prefix.Prefix}
									className="bg-slate-700 px-8 py-4 rounded"
								>
									{prefix.Prefix.replace("packages", "").replaceAll("/", "")}
								</Link>
							)
					)}
				</div>
			</div>
		</main>
	);
};

export default Home;
