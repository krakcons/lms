import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db/db";
import { courseUsers, courses } from "@/lib/db/schema";
import { getExpandedUsers } from "@/lib/users";
import { eq } from "drizzle-orm";
import { deleteCourse } from "../../actions";
import ExportCSVButton from "./ExportCSVButton";
import InviteUserDialog from "./InviteUserDialog";
import PublicLinkButton from "./PublicLinkButton";
import UsersTable from "./UsersTable";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const data = await db
		.select()
		.from(courses)
		.where(eq(courses.id, courseId));

	if (!data || !data.length) throw new Error("Course not found");
	const course = data[0];

	const users = await db
		.select()
		.from(courseUsers)
		.where(eq(courseUsers.courseId, course.id));

	const deleteCourseAction = async () => {
		"use server";

		await deleteCourse(course.id);
	};

	const expandedUsers = getExpandedUsers(users, course.version);

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h2 className="mr-4 overflow-hidden text-ellipsis whitespace-nowrap">
					{course.name}
				</h2>
				<div className="flex">
					<ExportCSVButton expandedUsers={expandedUsers} />
					<PublicLinkButton courseId={courseId} />
					<InviteUserDialog courseId={courseId} />
				</div>
			</div>
			<UsersTable expandedUsers={expandedUsers} />
			<div className="mt-8">
				<h4 className="mb-4">Danger Zone</h4>
				<form action={deleteCourseAction}>
					<Button variant="destructive">Delete Course</Button>
				</form>
			</div>
		</>
	);
};

export default Page;
