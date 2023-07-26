import { XMLParser } from "fast-xml-parser";
import { env } from "@/env.mjs";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/router";

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
	searchParams: { identifier },
}: {
	params: { id: string };
	searchParams: { identifier?: string };
}) => {
	const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/scorm/packages/${id}/imsmanifest.xml`, {
		cache: "no-cache",
	});
	const text = await res.text();
	const parsedIMSManifest = parser.parse(text).manifest;

	const scorm = IMSManifestSchema.parse(parsedIMSManifest);

	const firstOrganization = Array.isArray(scorm.organizations.organization)
		? scorm.organizations.organization[0]
		: scorm.organizations.organization;

	const resources = getAllResources(scorm.resources.resource);

	// Find first resource
	console.log(resources.find((resource) => resource.identifier === identifier)?.href);

	return (
		<main className="bg-slate-100 h-screen flex flex-row w-full">
			<aside className="p-4 text-slate-600 flex-col max-w-sm bg-white">
				{Array.isArray(firstOrganization.item) ? (
					firstOrganization.item.map((item) => {
						if (Array.isArray(item.item)) {
							return (
								<div key={item.identifier} className="flex-col">
									<p className="text-slate-800 font-bold py-2">{item.title}</p>
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
			{identifier && (
				<iframe
					className="flex-1"
					src={`${env.NEXT_PUBLIC_SERVER_URL}/scorm/packages/${id}/${
						resources.find((resource) => resource.identifier === identifier)?.href
					}`}
				/>
			)}
		</main>
	);
};

export default Page;
