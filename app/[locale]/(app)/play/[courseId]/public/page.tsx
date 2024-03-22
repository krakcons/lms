import { db } from "@/server/db/db";
import { modules } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PublicEmailForm from "./_components/PublicEmailForm";

const Page = async ({
	params: { courseId, locale },
}: {
	params: { courseId: string; locale: string };
}) => {
	const courseModule = await db.query.modules.findFirst({
		where: and(
			eq(modules.courseId, courseId),
			eq(modules.language, locale)
		),
	});

	if (!courseModule) {
		return notFound();
	}

	return (
		<main className="m-auto flex flex-col">
			<h1 className="mb-8">Join this course</h1>
			<PublicEmailForm moduleId={courseModule.id} courseId={courseId} />
		</main>
	);
};

export default Page;
