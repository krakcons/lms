import { db } from "@/libs/db/db";
import { courseUsers, courses } from "@/libs/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

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

	const users = await db
		.select()
		.from(courseUsers)
		.where(eq(courseUsers.courseId, Number(courseId)));

	const course = data[0];

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
			<div>
				<h2 className="mb-4 text-xl">Users</h2>
				{users.map((user) => (
					<div
						key={user.id}
						className="mb-4 bg-elevation-2 p-6 text-sm transition-colors hover:bg-elevation-3"
					>
						{user.userId}
					</div>
				))}
			</div>
		</>
	);
};

export default Page;
