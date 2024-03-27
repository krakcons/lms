import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Link, redirect } from "@/lib/navigation";
import { getAuth, getTeam } from "@/server/actions/auth";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import CreateCourseForm from "./CreateCourseForm";

const Page = async ({ params: { teamId } }: { params: { teamId: string } }) => {
	const { user } = await getAuth();
	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/dashboard");
	}

	const courseList = await db.query.courses.findMany({
		where: eq(courses.teamId, team.id),
	});

	return (
		<>
			<h1 className="mb-6">Courses</h1>
			<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							className="flex h-32 flex-col"
						>
							<div className="flex flex-col items-center justify-center gap-4">
								<Plus size={24} />
								Create Course
							</div>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>Create Course</DialogTitle>
						<CreateCourseForm teamId={teamId} />
					</DialogContent>
				</Dialog>
				{courseList?.map((course) => (
					<Link
						href={`/dashboard/${teamId}/courses/${course.id}`}
						key={course.id}
						className={buttonVariants({
							variant: "outline",
							className: "relative h-32 w-full gap-4 p-4",
						})}
					>
						<p className="truncate text-center">{course.name}</p>
						<Badge variant="outline" className="absolute top-2">
							Free
						</Badge>
					</Link>
				))}
			</div>
			<h1 className="mb-6 mt-12">Collections</h1>
			<p className="mb-2 font-semibold text-blue-300">
				Volunteer Onboarding
			</p>
			<div className="flex flex-col rounded-xl border border-blue-400 p-3">
				<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								className="flex h-32 flex-col"
							>
								<div className="flex flex-col items-center justify-center gap-4">
									<Plus size={24} />
									Add Course
								</div>
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>Add Course</DialogTitle>
							{/* <CreateCourseForm /> */}
						</DialogContent>
					</Dialog>
					{courseList?.map((course) => (
						<Link
							href={`/dashboard/${teamId}courses/${course.id}`}
							key={course.id}
							className={buttonVariants({
								variant: "outline",
								className: "relative h-32 w-full gap-4 p-4",
							})}
						>
							<p className="truncate text-center">
								{course.name}
							</p>
							<Badge variant="outline" className="absolute top-2">
								Free
							</Badge>
						</Link>
					))}
				</div>
			</div>
		</>
	);
};

export default Page;
