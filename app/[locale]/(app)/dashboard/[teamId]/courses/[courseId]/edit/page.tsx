import { EditCourseForm } from "@/components/course/EditCourseForm";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { and, eq } from "drizzle-orm";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";

const Page = async ({
	params: { locale, teamId, courseId },
}: {
	params: {
		locale: Language;
		teamId: string;
		courseId: string;
	};
}) => {
	unstable_noStore();
	const course = await db.query.courses.findFirst({
		where: and(eq(courses.id, courseId), eq(courses.teamId, teamId)),
		with: {
			translations: true,
		},
	});

	if (!course) {
		return notFound();
	}

	return (
		<EditCourseForm
			translations={course.translations}
			language={locale}
			courseId={courseId}
		/>
	);
};

export default Page;
