import { db } from "@/server/db/db";
import { modules } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import PublicEmailForm from "./PublicEmailForm";

const Page = async ({
	params: { courseId, locale },
}: {
	params: { courseId: string; locale: string };
}) => {
	unstable_setRequestLocale(locale);
	unstable_noStore();

	const courseModule = await db.query.modules.findFirst({
		where: and(
			eq(modules.courseId, courseId),
			eq(modules.language, locale)
		),
	});

	console.log(courseModule);

	const t = await getTranslations({ locale });

	if (!courseModule) {
		return notFound();
	}

	return (
		<main className="m-auto flex flex-col">
			<h1 className="mb-8">{t("Public.title")}</h1>
			<PublicEmailForm
				moduleId={courseModule.id}
				courseId={courseId}
				text={{
					email: t("Form.email"),
					submit: t("Form.submit"),
					guest: t("Public.guest"),
				}}
			/>
		</main>
	);
};

export default Page;
