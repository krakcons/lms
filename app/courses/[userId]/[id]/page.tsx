import { s3Client } from "@/libs/s3";
import { IMSManifestSchema, Resource } from "@/types/scorm/content";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { XMLParser } from "fast-xml-parser";
import Link from "next/link";
import { MdClose } from "react-icons/md";
import LMSProvider from "./LMSProvider";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

const getAllResources = (resource: Resource | Resource[]): Resource[] => {
	const resources: Resource[] = [];

	const traverseResource = (res: Resource | Resource[]): void => {
		if (Array.isArray(res)) {
			res.forEach((subRes) => {
				resources.push(subRes);
				traverseResource(subRes);
			});
		} else if (res) {
			resources.push(res);
		}
	};

	traverseResource(resource);
	return resources;
};

const Page = async ({
	params: { id },
	searchParams,
}: {
	params: { id: string };
	searchParams: { page?: string; toc?: string };
}) => {
	const { page, toc = "open" } = searchParams;

	const res = await s3Client.send(
		new GetObjectCommand({
			Bucket: "krak-lms",
			Key: `packages/${id}/imsmanifest.xml`,
		})
	);
	const text = await res.Body?.transformToString();

	if (!text) return <h1>404</h1>;

	const parsedIMSManifest = parser.parse(text).manifest;

	const scorm = IMSManifestSchema.parse(parsedIMSManifest);

	const firstOrganization = Array.isArray(scorm.organizations.organization)
		? scorm.organizations.organization[0]
		: scorm.organizations.organization;

	const resources = getAllResources(scorm.resources.resource);

	// Find first resource
	console.log(resources.find((resource) => resource.identifier === page)?.href);

	return (
		<main className="bg-slate-100 h-screen flex flex-col w-full">
			<header className="h-10 bg-white px-4 flex items-center shadow">
				<Link
					href={{
						pathname: `/packages/${id}`,
						query: { ...searchParams, toc: "open" },
					}}
					className="text-slate-900 "
				>
					Table of Contents
				</Link>
			</header>
			<div className="flex-row flex flex-1">
				{toc === "open" && (
					<aside className="p-4 fixed sm:relative max-w-sm left-0 top-0 bottom-0 text-slate-600 bg-white flex flex-col">
						<Link
							href={{
								pathname: `/packages/${id}`,
								query: { ...searchParams, toc: "closed" },
							}}
							className="bg-slate-500 text-white p-1 rounded mb-4 flex self-end"
						>
							<MdClose size={25} />
						</Link>
						<h3 className="text-2xl text-slate-700 font-bold mb-2">
							Table of Contents
						</h3>
						{Array.isArray(firstOrganization.item) ? (
							firstOrganization.item.map((item) => {
								if (Array.isArray(item.item)) {
									return (
										<div key={item.identifier} className="flex-col">
											<p className="text-slate-800 font-bold py-2">
												{item.title}
											</p>
											{item.item.map((subItem) => (
												<Link
													className="ml-4 py-1 flex cursor-pointer"
													key={subItem.identifier}
													href={{
														pathname: `/packages/${id}`,
														query: { page: subItem.identifierref },
													}}
												>
													{subItem.title}
												</Link>
											))}
										</div>
									);
								}
								return (
									<Link
										className="ml-4 py-1 flex cursor-pointer"
										key={item.identifier}
										href={{
											pathname: `/packages/${id}`,
											query: { page: item.identifierref },
										}}
									>
										{item.title}
									</Link>
								);
							})
						) : (
							<Link
								className="ml-4 py-1 flex cursor-pointer"
								href={{
									pathname: `/packages/${id}`,
									query: { page: firstOrganization.item.identifierref },
								}}
							>
								{firstOrganization.item.title}
							</Link>
						)}
					</aside>
				)}
				{page && (
					<LMSProvider version={scorm.metadata.schemaversion}>
						<iframe
							src={`/packages/${id}/${
								resources.find((resource) => resource.identifier === page)?.href
							}`}
							className="flex-1 h-full"
						/>
					</LMSProvider>
				)}
			</div>
		</main>
	);
};

export default Page;
