import { serverTrpc } from "@/app/[locale]/_trpc/server";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import InviteLearnerDialog from "./_components/InviteLearnerDialog";
import LearnersTable from "./_components/LearnersTable";
import PublicLinkButton from "./_components/PublicLinkButton";

export const runtime = "nodejs";

const Table = async ({ courseId }: { courseId: string }) => {
	const learners = await serverTrpc.learner.find({
		courseId,
	});

	return <LearnersTable learners={learners} />;
};

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	return (
		<main>
			<div className="flex items-center justify-between">
				<div>
					<h2>Learners</h2>
					<p className="text-muted-foreground">
						View and manage this courses learners
					</p>
				</div>
				<InviteLearnerDialog courseId={courseId} />
			</div>
			<Separator className="my-8" />
			<PublicLinkButton courseId={courseId} />
			<Separator className="my-8" />
			<Suspense fallback={<div>Loading...</div>}>
				<Table courseId={courseId} />
			</Suspense>
		</main>
	);
};

export default Page;
