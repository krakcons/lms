import { env } from "@/env";
import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { Metadata } from "next";

export const playMetadata = async ({
	prefix,
	params,
}: {
	prefix: string;
	params: Promise<{ courseId: string; locale: string; teamId: string }>;
}): Promise<Metadata> => {
	const { courseId, locale, teamId } = await params;
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

	const courseTranslation = translate(course.translations, locale);
	const teamTranslation = translate(course.team.translations, locale);

	return {
		title: `${prefix}${courseTranslation.name} | ${teamTranslation.name}`,
		description: courseTranslation.description,
		openGraph: {
			images: [`${env.NEXT_PUBLIC_SITE_URL}/cdn/${teamTranslation.logo}`],
		},
		icons: {
			icon: `${env.NEXT_PUBLIC_SITE_URL}/cdn/${teamTranslation.favicon}`,
		},
	};
};
