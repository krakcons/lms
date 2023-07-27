import { XMLParser } from "fast-xml-parser";
import { env } from "@/env.mjs";
import { z } from "zod";
import Link from "next/link";
import { MdClose } from "react-icons/md";
import { s3Client } from "@/libs/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const BaseItemSchema = z.object({
	identifier: z.string(),
	identifierref: z.string().optional(),
	isvisible: z.boolean().optional(),
	title: z.string(),
});
type BaseItem = z.infer<typeof BaseItemSchema>;

const ItemShema = z.object({
	...BaseItemSchema.shape,
	item: BaseItemSchema.or(BaseItemSchema.array()).optional(),
});
type Item = z.infer<typeof ItemShema>;

const OrganizationSchema = z.object({
	identifier: z.string(),
	title: z.string(),
	item: ItemShema.or(ItemShema.array()),
});
type Organization = z.infer<typeof OrganizationSchema>;

const FileSchema = z.object({
	href: z.string(),
});

const ResourceSchema = z.object({
	identifier: z.string(),
	href: z.string().optional(),
	file: FileSchema.or(FileSchema.array()),
});
type Resource = z.infer<typeof ResourceSchema>;

const IMSManifestSchema = z.object({
	metadata: z.object({
		schema: z.string(),
		schemaversion: z.number().or(z.string()).optional(),
	}),
	organizations: z.object({
		default: z.string().optional(),
		organization: OrganizationSchema.or(OrganizationSchema.array()),
	}),
	resources: z.object({
		resource: ResourceSchema.or(ResourceSchema.array()),
	}),
});
type IMSManifest = z.infer<typeof IMSManifestSchema>;

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

// Perform a depth-first search of the organization tree
const getAllItems = (organization: Organization): BaseItem[] => {
	const items: BaseItem[] = [];

	const traverseItem = (item: Item | Item[]): void => {
		if (Array.isArray(item)) {
			item.forEach((subItem) => traverseItem(subItem));
		} else if (item) {
			items.push(item);
			if (item.item) {
				traverseItem(item.item);
			}
		}
	};

	traverseItem(organization.item);
	return items;
};

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
	searchParams: { identifier?: string; toc?: string };
}) => {
	const { identifier, toc = "open" } = searchParams;

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

	return (
		<main className="bg-slate-100 h-screen flex flex-col w-full">
			<header className="h-10 bg-white px-4 flex items-center">
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
			{toc === "open" && (
				<aside className="p-4 fixed left-0 top-0 bottom-0 text-slate-600 bg-white flex flex-col">
					<Link
						href={{
							pathname: `/packages/${id}`,
							query: { ...searchParams, toc: "closed" },
						}}
						className="bg-slate-500 text-white p-1 rounded mb-4 flex self-end"
					>
						<MdClose size={25} />
					</Link>
					<h3 className="text-2xl text-slate-700 font-bold mb-2">Table of Contents</h3>
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
													query: { identifier: subItem.identifierref },
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
										query: { identifier: item.identifierref },
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
								query: { identifier: firstOrganization.item.identifierref },
							}}
						>
							{firstOrganization.item.title}
						</Link>
					)}
				</aside>
			)}
			{identifier && (
				<iframe
					className="flex-1"
					src={`${env.S3_URI}/packages/${id}/${
						resources.find((resource) => resource.identifier === identifier)?.href
					}`}
				/>
			)}
		</main>
	);
};

export default Page;
