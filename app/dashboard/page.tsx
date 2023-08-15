import { db } from "@/libs/db/db";
import { courses } from "@/libs/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import Link from "next/link";

const Page = async () => {
	const { userId } = auth();

	if (!userId) return null;

	const data = await db
		.select()
		.from(courses)
		.where(eq(courses.userId, userId));

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h1 className="text-2xl sm:text-4xl">Courses</h1>
				<Link href="/dashboard/upload" className="btn">
					Upload
				</Link>
			</div>
			<div className="flex flex-col">
				{data.map((course) => (
					<Link
						key={course.id}
						href={`/dashboard/courses/${course.id}`}
						className="li"
					>
						{course.name}
					</Link>
				))}
			</div>
		</>
	);
};

export default Page;
