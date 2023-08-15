import { db } from "@/libs/db/db";
import { courseUsers, courses } from "@/libs/db/schema";
import { filterUserForClient } from "@/libs/users";
import { clerkClient } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { deleteCourse } from "../../actions";

const getCourseUsers = async (courseId: number) => {
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
			user: {
				...user,
			},
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

	const users = await getCourseUsers(Number(courseId));

	const course = data[0];

	const deleteCourseAction = async () => {
		"use server";

		await deleteCourse(Number(courseId));
	};

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h1 className="mr-4 overflow-hidden text-ellipsis whitespace-nowrap text-2xl sm:text-4xl">
					{course.name}
				</h1>
				<Link href={`/courses/${course.id}`} className="btn">
					Visit
				</Link>
			</div>
			<div className="mb-8">
				<h2 className="mb-4 text-lg sm:text-xl">Users</h2>
				<div className="mb-4 h-[1px] bg-elevation-4" />
				{users.map((user) => (
					<div
						key={user.id}
						className="mb-4 flex flex-1 items-center justify-between overflow-hidden text-ellipsis"
					>
						<div className="flex items-center">
							<Image
								src={user.user.imageUrl}
								height={40}
								width={40}
								className="mr-4 rounded-full"
								alt="User Image"
							/>
							<div>
								<p className="text-sm sm:text-base">
									{user.user.firstName} {user.user.lastName}
								</p>
								{user.user.emailAddresses.length > 0 && (
									<p className="mt-1 text-xs opacity-70 sm:text-sm">
										{
											user.user.emailAddresses[0]
												.emailAddress
										}
									</p>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="">
				<h2 className="mb-4 text-lg sm:text-xl">Danger Zone</h2>
				<div className="flex items-center justify-between border border-red-700 p-4">
					<span>
						<p className="mb-1 text-sm sm:text-base">
							Delete this course
						</p>
						<p className="text-xs opacity-80 sm:text-sm">
							This action is perminant
						</p>
					</span>
					<form action={deleteCourseAction}>
						<button className="btn-error">Delete</button>
					</form>
				</div>
			</div>
		</>
	);
};

export default Page;
