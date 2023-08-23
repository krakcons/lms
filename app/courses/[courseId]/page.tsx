import { buttonVariants } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { db } from "@/lib/db/db";
import { courseUsers } from "@/lib/db/schema";
import { s3Client } from "@/lib/s3";
import { getInitialScormData } from "@/lib/scorm";
import { IMSManifestSchema, Resource } from "@/types/scorm/content";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import { List } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import LMSProvider from "./LMSProvider";

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
});

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
	params: { courseId },
	searchParams,
}: {
	params: { courseId: string };
	searchParams: { page?: string };
}) => {
	const { page } = searchParams;
	const userId = auth().userId;

	if (!userId) throw new Error("User not found");

	const res = await s3Client.send(
		new GetObjectCommand({
			Bucket: "krak-lms",
			Key: `courses/${courseId}/imsmanifest.xml`,
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

	if (!page) {
		redirect(`/courses/${courseId}?page=${resources[0].identifier}`);
	}

	// Get course user
	let courseUser = await db
		.select()
		.from(courseUsers)
		.where(
			and(
				eq(courseUsers.courseId, Number(courseId)),
				eq(courseUsers.userId, userId)
			)
		);

	// If no course user exists, create one
	if (courseUser.length === 0) {
		console.log("Creating course user");
		const newCourseUser = {
			courseId: Number(courseId),
			userId,
			data: getInitialScormData(`${scorm.metadata.schemaversion}`),
		};
		const res = await db.insert(courseUsers).values(newCourseUser);
		if (res.insertId) {
			courseUser = [{ ...newCourseUser, id: Number(res.insertId) }];
		} else {
			throw new Error("Failed to create course user");
		}
	}

	console.log("DATA", courseUser[0].data as Record<string, any>);

	return (
		<main className="flex h-screen w-full flex-col bg-slate-100">
			<Sheet>
				<SheetTrigger>
					<div
						className={buttonVariants({
							variant: "secondary",
							size: "icon",
							className: "fixed right-4 top-4",
						})}
					>
						<List />
					</div>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Table of Contents</SheetTitle>
						{Array.isArray(firstOrganization.item) ? (
							firstOrganization.item.map((item) => {
								if (Array.isArray(item.item)) {
									return (
										<div
											key={item.identifier}
											className="flex-col"
										>
											<p>{item.title}</p>
											{item.item.map((subItem) => (
												<Link
													className="ml-4 flex cursor-pointer py-1"
													key={subItem.identifier}
													href={{
														pathname: `/courses/${courseId}`,
														query: {
															page: subItem.identifierref,
														},
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
										className="ml-4 flex cursor-pointer py-1"
										key={item.identifier}
										href={{
											pathname: `/courses/${courseId}`,
											query: {
												page: item.identifierref,
											},
										}}
									>
										{item.title}
									</Link>
								);
							})
						) : (
							<Link
								className="ml-4 flex cursor-pointer py-1"
								href={{
									pathname: `/courses/${courseId}`,
									query: {
										page: firstOrganization.item
											.identifierref,
									},
								}}
							>
								{firstOrganization.item.title}
							</Link>
						)}
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<div className="flex flex-1 flex-row">
				{page && (
					<LMSProvider
						version={`${scorm.metadata.schemaversion}`}
						courseId={Number(courseId)}
						data={courseUser[0].data as Record<string, any>}
					>
						<iframe
							src={`/courses/${courseId}/${resources.find(
								(resource) => resource.identifier === page
							)?.href}`}
							className="h-full flex-1"
						/>
					</LMSProvider>
				)}
			</div>
		</main>
	);
};

export default Page;
