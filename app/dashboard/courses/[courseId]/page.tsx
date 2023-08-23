import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/lib/db/db";
import { courseUsers, courses } from "@/lib/db/schema";
import { filterUserForClient } from "@/lib/users";
import { CourseUser } from "@/types/courseUser";
import { WithUser } from "@/types/users";
import { clerkClient } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { deleteCourse } from "../../actions";
import { columns } from "./columns";

const getCourseUsers = async (
	courseId: number
): Promise<WithUser<CourseUser>[]> => {
	const courseUsersList = await db
		.select()
		.from(courseUsers)
		.where(eq(courseUsers.courseId, Number(courseId)));

	const userId = courseUsersList.map((courseUser) => courseUser.userId);

	const clerkUsers = (
		await clerkClient.users.getUserList({
			userId,
		})
	).map(filterUserForClient);

	return courseUsersList.map((courseUser) => {
		const user = clerkUsers.find(
			(clerkUser) => courseUser.userId === clerkUser.id
		);

		if (!user) throw new Error("User not found");

		return {
			...courseUser,
			user,
		};
	});
};

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const data = await db
		.select()
		.from(courses)
		.where(eq(courses.id, Number(courseId)));

	if (!data || !data.length) throw new Error("Course not found");
	const course = data[0];

	const users = await getCourseUsers(course.id);
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
				<Link
					href={`/courses/${course.id}`}
					target="_blank"
					className={buttonVariants()}
				>
					Visit
				</Link>
			</div>
			<div className="mb-8">
				<DataTable data={usersWithVersion} columns={columns} />
			</div>
			<div className="">
				<h4 className="mb-4">Danger Zone</h4>
				<form action={deleteCourseAction}>
					<Button variant="destructive">Delete Course</Button>
				</form>
			</div>
		</>
	);
};

export default Page;
