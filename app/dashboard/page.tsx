import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import Link from "next/link";
import CourseTable from "./CourseTable";

const Page = async () => {
	const { teamId } = getAuth();

	const data = await db
		.select()
		.from(courses)
		.where(eq(courses.teamId, teamId));

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
