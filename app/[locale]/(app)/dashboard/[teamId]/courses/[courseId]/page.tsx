import { redirect } from "@/lib/navigation";
import { getAuth } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { eq } from "drizzle-orm";

import { notFound } from "next/navigation";

const Page = async ({
	params: { courseId, locale },
}: {
	params: { courseId: string; locale: Language };
}) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const course = await db.query.courses.findFirst({
		where: eq(courses.id, courseId),
		with: {
			translations: true,
		},
	});

	if (!course) {
		return notFound();
	}

	return redirect(`/dashboard/${course.teamId}/courses/${courseId}/learners`);
};

export default Page;
