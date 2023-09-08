import { buttonVariants } from "@/components/ui/Button";
import { db } from "@/lib/db/db";
import { courses } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import Link from "next/link";
import CourseTable from "./CourseTable";

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
				<h1>Courses</h1>
				<Link href="/dashboard/upload" className={buttonVariants()}>
					Upload
				</Link>
			</div>
			<div className="flex flex-col">
				<CourseTable data={data} />
			</div>
		</>
	);
};

export default Page;
