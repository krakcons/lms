import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db/db";
import { courseUsers, courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteCourse } from "../../actions";
import InviteUserDialog from "./InviteUserDialog";
import { columns } from "./columns";

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
	const usersWithVersion = users.map((user) => ({
		...user,
		version: course.version,
	}));

	const deleteCourseAction = async () => {
		"use server";

		await deleteCourse(course.id);
	};

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h2 className="mr-4 overflow-hidden text-ellipsis whitespace-nowrap">
					{course.name}
				</h2>
				<InviteUserDialog
					courseId={courseId}
					version={course.version}
				/>
			</div>
			<DataTable data={usersWithVersion} columns={columns} />
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
