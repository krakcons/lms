import { serverTrpc } from "@/app/[locale]/_trpc/server";
import { Separator } from "@/components/ui/separator";
import { getExpandedLearners } from "@/lib/learner";
import ExportCSVButton from "./_components/ExportCSVButton";
import InviteLearnerDialog from "./_components/InviteLearnerDialog";
import PublicLinkButton from "./_components/PublicLinkButton";
import UsersTable from "./_components/UsersTable";

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
			<h2>Learners</h2>
			<p className="text-muted-foreground">
				View and manage this courses learners
			</p>
			<Separator className="my-8" />
			<div className="mb-12 flex w-full items-center justify-between">
				<div className="flex">
					<ExportCSVButton expandedLearners={expandedLearners} />
					<PublicLinkButton courseId={courseId} />
					<InviteLearnerDialog courseId={courseId} />
				</div>
			</div>
			<UsersTable expandedLearners={expandedLearners} />
		</main>
	);
};

export default Page;
