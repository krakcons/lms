import { env } from "@/env.mjs";
import { translate } from "@/lib/translation";
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

const parseCourse = async (url: string) => {
	const res = await fetch(url);
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
	params: { courseId, locale, teamId },
	searchParams: { learnerId },
}: {
	params: { courseId: string; locale: string; teamId: string };
	searchParams: { learnerId?: string };
}) => {
	unstable_noStore();
	if (!learnerId) {
		throw new Error("Learner ID not found");
	}

	// Get course user
	const learner = await db.query.learners.findFirst({
		where: and(eq(learners.id, learnerId)),
		with: {
			module: {
				with: {
					course: {
						with: {
							translations: true,
							team: {
								with: {
									translations: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!learner) {
		return (
			<div>
				<p>No learner found with this id</p>
			</div>
		);
	}

	if (!learner.module) {
		return (
			<div>
				<p>Learner has no module</p>
			</div>
		);
	}

	const extendedLearner = ExtendLearner(learner.module.type).parse(learner);

	const { scorm, resources } = await parseCourse(
		`${env.NEXT_PUBLIC_R2_URL}/${teamId}/courses/${courseId}/${learner.module.language}/imsmanifest.xml`
	);

	return (
		<main className="flex h-screen w-full flex-col bg-slate-100">
			<div className="flex flex-1 flex-row">
				<LMSProvider
					type={`${scorm.metadata.schemaversion}`}
					learner={extendedLearner}
					courseName={
						translate(learner.module.course.translations, locale)
							.name
					}
					teamName={
						translate(
							learner.module.course.team.translations,
							locale
						).name
					}
					url={`/${learner.module.language}/r2/${teamId}/courses/${courseId}/${learner.module.language}/${resources[0].href}`}
				/>
			</div>
		</main>
	);
};

export default Page;
