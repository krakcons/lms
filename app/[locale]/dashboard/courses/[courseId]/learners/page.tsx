import { serverTrpc } from "@/app/[locale]/_trpc/server";
import CopyButton from "@/components/CopyButton";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env.mjs";
import { Suspense } from "react";
import InviteLearnerDialog from "./_components/InviteLearnerDialog";
import LearnersTable from "./_components/LearnersTable";

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
			<div className="flex w-full flex-col gap-1">
				<p>Share public link</p>
				<div
					className={buttonVariants({
						variant: "secondary",
						className: "flex-1 justify-between gap-3",
					})}
				>
					<p className="truncate text-sm text-muted-foreground">
						{env.NEXT_PUBLIC_SITE_URL}/play/{courseId}/public
					</p>
					<CopyButton
						text={`${env.NEXT_PUBLIC_SITE_URL}/play/${courseId}/public`}
					/>
				</div>
			</div>
			<Separator className="my-8" />
			<Suspense fallback={<div>Loading...</div>}>
				<Table courseId={courseId} />
			</Suspense>
		</main>
	);
};

export default Page;
