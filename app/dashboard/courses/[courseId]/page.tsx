import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import { getExpandedLearners } from "@/lib/learner";
import { eq } from "drizzle-orm";
import { deleteCourse } from "../../actions";
import ExportCSVButton from "./ExportCSVButton";
import InviteLearnerDialog from "./InviteLearnerDialog";
import PublicLinkButton from "./PublicLinkButton";
import UsersTable from "./UsersTable";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const data = await db
		.select()
		.from(courses)
		.where(eq(courses.id, courseId));

	if (!data || !data.length) throw new Error("Course not found");
	const course = data[0];

	const learner = await db
		.select()
		.from(learners)
		.where(eq(learners.courseId, course.id));

	const deleteCourseAction = async () => {
		"use server";

		await deleteCourse(course.id);
	};

	const expandedLearners = getExpandedLearners(learner, course.version);

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h2 className="mr-4 overflow-hidden text-ellipsis whitespace-nowrap">
					{course.name}
				</h2>
				<div className="flex">
					<ExportCSVButton expandedLearners={expandedLearners} />
					<PublicLinkButton courseId={courseId} />
					<InviteLearnerDialog courseId={courseId} />
				</div>
			</div>
			<UsersTable expandedLearners={expandedLearners} />
			<div className="mt-8">
				<h4 className="mb-4">Danger Zone</h4>
				<AlertDialog>
					<AlertDialogTrigger>
						<Button variant="destructive">Delete Course</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Are you absolutely sure?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This action will
								permanently this course and all its users.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<form action={deleteCourseAction}>
								<AlertDialogAction type="submit">
									Continue
								</AlertDialogAction>
							</form>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</>
	);
};

export default Page;
