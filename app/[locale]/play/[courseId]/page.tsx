import { env } from "@/env.mjs";
import { redirect } from "@/lib/navigation";
import { getLearner } from "@/server/actions";
import { IMSManifestSchema, Resource } from "@/types/scorm/content";
import { XMLParser } from "fast-xml-parser";
import LMSProvider from "./_components/LMSProvider";

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

const parseCourse = async (courseId: string) => {
	const res = await fetch(
		`${env.NEXT_PUBLIC_SITE_URL}/content/${courseId}/imsmanifest.xml`
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
	if (!learnerId) {
		redirect(`/play/${courseId}/public`);
		return;
	}

	// Get course user
	let { data: learner } = await getLearner({
		id: learnerId,
		courseId,
	});

	if (!learner) {
		throw new Error("Learner not found");
	}

	const { scorm, resources } = await parseCourse(courseId);

	return (
		<main className="flex h-screen w-full flex-col bg-slate-100">
			<div className="flex flex-1 flex-row">
				<LMSProvider
					version={`${scorm.metadata.schemaversion}`}
					learner={learner}
				>
					<iframe
						src={`/content/${courseId}/${resources[0].href}`}
						className="flex-1"
					/>
				</LMSProvider>
			</div>
		</main>
	);
};

export default Page;
