import CopyButton from "@/components/CopyButton";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env";
import { redirect } from "@/lib/navigation";
import { getAuth, getTeam, getUserRole } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { ExtendLearner } from "@/types/learner";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import InviteLearnerDialog from "./InviteLearnerDialog";
import LearnersTable from "./LearnersTable";

export const runtime = "nodejs";

const CopyText = async ({ text }: { text: string }) => {
	return (
		<div
			className={buttonVariants({
				variant: "secondary",
				className: "flex-1 justify-between gap-3",
			})}
		>
			<p className="truncate text-sm text-muted-foreground">{text}</p>
			<CopyButton text={text} />
		</div>
	);
};

const Table = async ({
	courseId,
	teamId,
}: {
	courseId: string;
	teamId: string;
}) => {
	const { user } = await getAuth();

	if (!user) {
		return null;
	}
	const team = await getTeam(teamId, user.id);

	const learnerList = await db.query.learners.findMany({
		where: eq(learners.courseId, courseId),
		with: {
			module: true,
		},
	});

	const role = await getUserRole(teamId);

	const extendedLearnerList = learnerList.map((learner) => {
		return {
			...ExtendLearner(learner.module?.type).parse(learner),
			module: learner.module,
			joinLink:
				role === "owner"
					? team?.customDomain &&
						env.NEXT_PUBLIC_SITE_URL !== "http://localhost:3000"
						? `https://${team.customDomain}/courses/${courseId}/join?learnerId=${learner.id}`
						: `${env.NEXT_PUBLIC_SITE_URL}/play/${team?.id}/courses/${courseId}/join?learnerId=${learner.id}`
					: undefined,
		};
	});

	return <LearnersTable learners={extendedLearnerList} />;
};

const Page = async ({
	params,
}: {
	params: Promise<{ courseId: string; teamId: string }>;
}) => {
	const { courseId, teamId } = await params;
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/dashboard");
	}

	return (
		<div className="flex w-full max-w-full flex-col">
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
				<p>Share join link</p>
				<CopyText
					text={
						team.customDomain
							? `https://${team.customDomain}/courses/${courseId}/join`
							: `${env.NEXT_PUBLIC_SITE_URL}/play/${teamId}/courses/${courseId}/join
						`
					}
				/>
				{env.NEXT_PUBLIC_SITE_URL === "http://localhost:3000" && (
					<CopyText
						text={`http://localhost:3000/play/${teamId}/courses/${courseId}/join`}
					/>
				)}
			</div>
			<Separator className="my-8" />
			<Suspense fallback={<div>Loading...</div>}>
				<Table courseId={courseId} teamId={teamId} />
			</Suspense>
		</div>
	);
};

export default Page;
