import LanguageToggle from "@/components/LanguageToggle";
import { env } from "@/env.mjs";
import { db } from "@/server/db/db";
import { courses, learners, modules } from "@/server/db/schema";
import { BaseLearner } from "@/types/learner";
import { Module } from "@/types/module";
import { Language } from "@/types/translations";
import { and, desc, eq } from "drizzle-orm";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { unstable_noStore } from "next/cache";
import { redirect } from "next/navigation";
import { playMetadata } from "../metadata";
import { JoinCourseForm } from "./JoinCourseForm";

export const generateMetadata = async ({
	params,
}: {
	params: { courseId: string; locale: Language; teamId: string };
}) => {
	const t = await getTranslations({ locale: params.locale });
	return playMetadata({
		prefix: `${t("Join.join")} `,
		params,
	});
};

const Page = async ({
	params: { courseId, locale, teamId },
	searchParams: { learnerId },
}: {
	params: { courseId: string; locale: Language; teamId: string };
	searchParams: { learnerId: string };
}) => {
	unstable_setRequestLocale(locale);
	unstable_noStore();

	let initialLearner: BaseLearner | undefined = undefined;
	if (learnerId) {
		console.log("learnerId", learnerId);
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, learnerId)),
			with: {
				module: {
					with: {
						course: {
							with: {
								team: true,
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

		console.log("learner module", learner);
		if (learner.module) {
			const team = learner.module.course.team;
			redirect(
				learner.module.course.team.customDomain
					? `https://${team.customDomain}/courses/${courseId}?learnerId=${learner.id}`
					: `${env.NEXT_PUBLIC_SITE_URL}/play/${teamId}/courses/${courseId}?learnerId=${learner.id}`
			);
		}
		initialLearner = learner;
	}

	const course = await db.query.courses.findFirst({
		where: and(eq(courses.id, courseId), eq(courses.teamId, teamId)),
		with: {
			modules: {
				orderBy: [desc(modules.versionNumber)],
			},
			translations: true,
		},
	});

	if (!course) {
		return (
			<div>
				<p>Course not found</p>
			</div>
		);
	}

	if (!course.modules || course.modules.length === 0) {
		return (
			<div>
				<p>Course has no modules</p>
			</div>
		);
	}

	const t = await getTranslations({ locale });

	// Get the first module for each language (will be the latest version)
	const maxVersionModules = new Map<Language, Module>();
	course.modules.forEach((module) => {
		if (!maxVersionModules.get(module.language)) {
			maxVersionModules.set(module.language, module);
		}
	});

	const modulesArray = Array.from(maxVersionModules.values());

	const defaultModule = modulesArray.find(
		(module) => module.language === locale
	);

	return (
		<>
			<div className="absolute right-4 top-4">
				<LanguageToggle />
			</div>
			<main className="m-auto flex w-full flex-col p-8 sm:w-[60%]">
				<JoinCourseForm
					locale={locale}
					modules={modulesArray}
					defaultModule={defaultModule ?? modulesArray[0]}
					course={course}
					initialLearner={initialLearner}
					text={{
						title1: t("Join.0.title"),
						title2: t("Join.1.title"),
						firstName: t("Form.learner.firstName"),
						lastName: t("Form.learner.lastName"),
						email: t("Form.learner.email"),
						join: t("Join.join"),
						continue: t("Join.continue"),
						back: t("Join.back"),
						languageLabel: t("Join.language"),
						languageDescription: t("Join.language-description"),
					}}
				/>
			</main>
		</>
	);
};

export default Page;
