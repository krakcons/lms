import { Separator } from "@/components/ui/separator";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { unstable_noStore } from "next/cache";
import CourseSettingsForm from "./CourseSettingsForm";
import DeleteCourseDialog from "./DeleteCourseDialog";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	unstable_noStore();
	const course = await db.query.courses.findFirst({
		where: eq(courses.id, courseId),
	});

	return (
		<main>
			<h2>Settings</h2>
			<p className="text-muted-foreground">Manage your course settings</p>
			<Separator className="my-8" />
			{course && <CourseSettingsForm course={course} />}
			<Separator className="my-8" />
			<h4 className="mb-4">Danger Zone</h4>
			<DeleteCourseDialog courseId={courseId} />
		</main>
	);
};

export default Page;
