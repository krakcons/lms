import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export const playMetadata = async ({
	prefix,
	params: { courseId, locale, teamId },
}: {
	prefix: string;
	params: { courseId: string; locale: string; teamId: string };
}) => {
	const course = await db.query.courses.findFirst({
		where: and(eq(courses.id, courseId), eq(courses.teamId, teamId)),
		with: {
			translations: true,
			team: {
				with: {
					translations: true,
				},
			},
		},
	});

	if (!course) {
		return {
			title: "Course not found",
		};
	}

	const t = await getTranslations({ locale });

	return {
		title: `${prefix}${translate(course.translations, locale).name} | ${translate(course.team.translations, locale).name}`,
		description: translate(course.translations, locale).description,
	};
};
