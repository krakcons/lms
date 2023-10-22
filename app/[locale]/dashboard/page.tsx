import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { serverTrpc } from "../_trpc/server";
import CourseTable from "./CourseTable";

export const runtime = "nodejs";

const Page = async () => {
	const courses = await serverTrpc.course.find();

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h1>Courses</h1>
				<Link href="/dashboard/upload" className={buttonVariants()}>
					Upload
				</Link>
			</div>
			<div className="flex flex-col">
				<CourseTable data={courses} />
			</div>
		</>
	);
};

export default Page;
