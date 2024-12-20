import NotFound from "@/app/NotFound";
import { env } from "@/env";
import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { ExtendLearner } from "@/types/learner";
import { IMSManifestSchema, Resource } from "@/types/scorm/content";
import { and, eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import { getTranslations } from "next-intl/server";
import { unstable_noStore } from "next/cache";
import LMSProvider from "./LMSProvider";
import { playMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ courseId: string; locale: string; teamId: string }>;
}) => {
	return playMetadata({
		prefix: "",
		params,
	});
};

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
	params,
	searchParams,
}: {
	params: Promise<{ courseId: string; locale: string; teamId: string }>;
	searchParams: Promise<{ learnerId?: string }>;
}) => {
	const { courseId, locale, teamId } = await params;
	unstable_noStore();
	const { learnerId } = await searchParams;
	if (!learnerId) {
		throw new Error("Learner ID not found");
	}

	// Get course user
	const learner = await db.query.learners.findFirst({
		where: and(eq(learners.id, learnerId), eq(learners.courseId, courseId)),
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
		return <NotFound description="Learner could not be found" />;
	}

	if (!learner.module) {
		return <NotFound description="Learner has no module" />;
	}

	const t = await getTranslations({ locale });

	const extendedLearner = ExtendLearner(learner.module.type).parse(learner);

	const { scorm, resources } = await parseCourse(
		`${env.NEXT_PUBLIC_SITE_URL}/cdn/${teamId}/courses/${courseId}/${learner.module.language}${learner.module.versionNumber === 1 ? "" : "_" + learner.module.versionNumber}/imsmanifest.xml`
	);

	return (
		<main className="flex h-screen w-full flex-col">
			<div className="flex flex-1 flex-row">
				<LMSProvider
					type={`${scorm.metadata.schemaversion}`}
					learner={extendedLearner}
					url={`/${learner.module.language}/cdn/${teamId}/courses/${courseId}/${learner.module.language}${learner.module.versionNumber === 1 ? "" : "_" + learner.module.versionNumber}/${resources[0].href}`}
					course={
						translate(learner.module.course.translations, locale)
							.name
					}
					text={{
						title: t("Certificate.dialog.title"),
						description: t("Certificate.dialog.description"),
						download: t("Certificate.download"),
						dontShowAgain: t("Certificate.dialog.dont-show"),
					}}
				/>
			</div>
		</main>
	);
};

export default Page;
