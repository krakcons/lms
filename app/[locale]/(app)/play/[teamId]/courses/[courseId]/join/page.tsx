import { redirect } from "@/lib/navigation";
import { db } from "@/server/db/db";
import { courses, learners } from "@/server/db/schema";
import { BaseLearner } from "@/types/learner";
import { and, eq } from "drizzle-orm";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { unstable_noStore } from "next/cache";
import { JoinCourseForm } from "./JoinCourseForm";

const Page = async ({
	params: { courseId, locale, teamId },
	searchParams: { learnerId },
}: {
	params: { courseId: string; locale: string; teamId: string };
	searchParams: { learnerId: string };
}) => {
	unstable_setRequestLocale(locale);
	unstable_noStore();

	let initialLearner: BaseLearner | undefined = undefined;
	if (learnerId) {
		const learner = await db.query.learners.findFirst({
			where: and(eq(learners.id, learnerId)),
			with: {
				module: true,
			},
		});

		if (!learner) {
			return (
				<div>
					<p>No learner found with this id</p>
				</div>
			);
		}
		if (learner.module) {
			redirect(
				`/play/${teamId}/courses/${courseId}?learnerId=${learnerId}`
			);
		}
		initialLearner = learner;
	}

	const course = await db.query.courses.findFirst({
		where: and(eq(courses.id, courseId), eq(courses.teamId, teamId)),
		with: {
			modules: true,
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

	const defaultModule = course.modules.find(
		(module) => module.language === locale
	);

	return (
		<main className="m-auto flex flex-col">
			<JoinCourseForm
				modules={course.modules}
				defaultModule={defaultModule ?? course.modules[0]}
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
				}}
			/>
		</main>
	);
};

export default Page;
