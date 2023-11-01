import { serverTrpc } from "@/app/[locale]/_trpc/server";
import { Separator } from "@/components/ui/separator";
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
	const learners = await serverTrpc.learner.find({ courseId });
	return (
		<main>
			<h2>Learners</h2>
			<p className="text-muted-foreground">
				View and manage this courses learners
			</p>
			<Separator className="my-8" />
			<div className="mb-12 flex w-full items-center justify-between">
				<div className="flex">
					<ExportCSVButton learners={learners} />
					<PublicLinkButton courseId={courseId} />
					<InviteLearnerDialog courseId={courseId} />
				</div>
			</div>
			<UsersTable learners={learners} />
		</main>
	);
};

export default Page;
