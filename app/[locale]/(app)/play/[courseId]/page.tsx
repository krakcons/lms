import { env } from "@/env.mjs";
import { redirect } from "@/lib/navigation";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { ExtendLearner } from "@/types/learner";
import { IMSManifestSchema, Resource } from "@/types/scorm/content";
import { and, eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import { unstable_noStore } from "next/cache";
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

const parseCourse = async (courseId: string, language: string) => {
	const res = await fetch(
		`${env.NEXT_PUBLIC_R2_URL}/courses/${courseId}/${language}/imsmanifest.xml`
	);
	const text = await res.text();

	if (!text) throw new Error("404");

	const parsedIMSManifest = parser.parse(text);

	const scorm = IMSManifestSchema.parse(parsedIMSManifest).manifest;

	const firstOrganization = Array.isArray(scorm.organizations.organization)
		? scorm.organizations.organization[0]
		: scorm.organizations.organization;

	const resources = getAllResources(scorm.resources.resource);

	return {
		scorm,
		firstOrganization,
		resources,
	};
};

const Page = async ({
	params: { courseId, locale },
	searchParams: { learnerId },
}: {
	params: { courseId: string; locale: string };
	searchParams: { learnerId?: string };
}) => {
	unstable_noStore();
	if (!learnerId) {
		redirect(`/play/${courseId}/public`);
		return;
	}

	// Get course user
	const learner = await db.query.learners.findFirst({
		where: and(eq(learners.id, learnerId)),
		with: {
			module: true,
		},
	});

	if (!learner) {
		throw new Error("Learner not found");
	}

	if (learner.module.language !== locale) {
		throw new Error("Learner found but language does not match");
	}

	const extendedLearner = ExtendLearner(learner.module.type).parse(learner);

	const { scorm, resources } = await parseCourse(courseId, locale);

	console.log("URL", resources[0].href);

	return (
		<main className="flex h-screen w-full flex-col bg-slate-100">
			<div className="flex flex-1 flex-row">
				<LMSProvider
					type={`${scorm.metadata.schemaversion}`}
					learner={extendedLearner}
					url={`/${locale}/r2/courses/${courseId}/${locale}/${resources[0].href}`}
				/>
			</div>
		</main>
	);
};

export default Page;
