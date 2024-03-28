import { db } from "@/server/db/db";
import { modules } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { JoinCourseForm } from "./JoinCourseForm";

const Page = async ({
	params: { courseId, locale, teamId },
}: {
	params: { courseId: string; locale: string; teamId: string };
}) => {
	unstable_setRequestLocale(locale);
	unstable_noStore();

	const courseModule = await db.query.modules.findFirst({
		where: and(
			eq(modules.courseId, courseId),
			eq(modules.language, locale)
		),
		with: {
			course: true,
		},
	});

	const t = await getTranslations({ locale });

	if (!courseModule) {
		return notFound();
	}

	return (
		<main className="m-auto flex flex-col">
			<h1 className="mb-8">{t("Public.title")}</h1>
			<JoinCourseForm
				moduleId={courseModule.id}
				courseId={courseId}
				text={{
					firstName: t("Form.learner.firstName"),
					lastName: t("Form.learner.lastName"),
					email: t("Form.learner.email"),
					submit: t("Form.submit"),
					guest: t("Public.guest"),
				}}
			/>
		</main>
	);
};

export default Page;
