import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Link, redirect } from "@/lib/navigation";
import { getAuth } from "@/server/actions/cached";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import CreateCourseForm from "./_components/CreateCourseForm";

const Page = async () => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const courseList = await db.query.courses.findMany({
		where: eq(courses.userId, user.id),
	});

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h1>Courses</h1>
			</div>
			<div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							className="flex h-56 flex-col"
						>
							<div className="flex flex-col items-center justify-center gap-4">
								<Plus size={24} />
								Create Course
							</div>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>Create Course</DialogTitle>
						<CreateCourseForm />
					</DialogContent>
				</Dialog>
				{courseList?.map((course) => (
					<Link
						href={`/dashboard/courses/${course.id}`}
						key={course.id}
						className={buttonVariants({
							variant: "outline",
							className: "relative h-56 w-full gap-4 p-4",
						})}
					>
						<p className="truncate text-center">{course.name}</p>
						<Badge variant="outline" className="absolute top-3">
							Free
						</Badge>
					</Link>
				))}
			</div>
		</>
	);
};

export default Page;
