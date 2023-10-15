import { serverTrpc } from "@/app/_trpc/server";
import { getExpandedLearners } from "@/lib/learner";
import DeleteCourseDialog from "./DeleteCourseDialog";
import ExportCSVButton from "./ExportCSVButton";
import InviteLearnerDialog from "./InviteLearnerDialog";
import PublicLinkButton from "./PublicLinkButton";
import UsersTable from "./UsersTable";

export const runtime = "nodejs";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const course = await serverTrpc.course.findOne({ id: courseId });

	const expandedLearners = getExpandedLearners(
		course.learners,
		course.version
	);

	return (
		<main>
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
				<DeleteCourseDialog courseId={courseId} />
			</div>
		</main>
	);
};

export default Page;
