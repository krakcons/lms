import { AddCourseDialog } from "@/components/collection/AddCourseDialog";
import { CollectionLearnerInvite } from "@/components/collection/CollectionLearnerInvite";
import { CreateCollectionDialog } from "@/components/collection/CreateCollectionDialog";
import RemoveCourseButton from "@/components/collection/RemoveCourseButton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Link, redirect } from "@/lib/navigation";
import { getAuth, getTeam } from "@/server/auth/actions";
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

	const collections = await db.query.collections.findMany({
		where: eq(courses.teamId, team.id),
		with: {
			collectionsToCourses: {
				with: {
					course: true,
				},
			},
		},
	});

	return (
		<>
			<h1 className="mb-6">Courses</h1>
			<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
					</Link>
				))}
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
			</div>
			<h1 className="mb-6 mt-12">Collections</h1>
			<div className="flex flex-col gap-4">
				{collections?.map((collection) => (
					<div key={collection.id} className="flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<div className="flex flex-col gap-1">
								<p className="text-lg font-semibold text-blue-300">
									{collection.name}
								</p>
								{collection.description && (
									<p className="text-sm text-muted-foreground opacity-90">
										{collection.description}
									</p>
								)}
							</div>
							<CollectionLearnerInvite
								collectionId={collection.id}
							/>
						</div>
						<div className="flex flex-col rounded-xl border border-blue-400 p-3">
							<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{collection.collectionsToCourses?.map(
									({ course }) => (
										<div
											className="relative"
											key={course.id}
										>
											<Link
												href={`/dashboard/${teamId}courses/${course.id}`}
												className={buttonVariants({
													variant: "outline",
													className:
														"relative h-32 w-full gap-4 p-4",
												})}
											>
												<p className="truncate text-center">
													{course.name}
												</p>
											</Link>
											<RemoveCourseButton
												collectionId={collection.id}
												courseId={course.id}
											/>
										</div>
									)
								)}
								<AddCourseDialog
									collectionId={collection.id}
									courses={courseList.filter(
										(course) =>
											!collection.collectionsToCourses?.find(
												({ course: c }) =>
													c.id === course.id
											)
									)}
								/>
							</div>
						</div>
					</div>
				))}
				<CreateCollectionDialog />
			</div>
		</>
	);
};

export default Page;
