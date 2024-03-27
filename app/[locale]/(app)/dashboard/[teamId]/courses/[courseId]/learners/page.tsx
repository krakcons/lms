import CopyButton from "@/components/CopyButton";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env.mjs";
import { redirect } from "@/lib/navigation";
import { getAuth, getTeam } from "@/server/actions/auth";
import { db } from "@/server/db/db";
import { modules } from "@/server/db/schema";
import { ExtendLearner } from "@/types/learner";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
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

const Table = async ({ courseId }: { courseId: string }) => {
	const { user } = await getAuth();

	if (!user) {
		return null;
	}

	const courseModules = await db.query.modules.findMany({
		where: eq(modules.courseId, courseId),
		with: {
			learners: true,
		},
	});
	const learners = courseModules.flatMap((module) =>
		ExtendLearner(module.type)
			.array()
			.parse(module.learners.map((learner) => learner))
	);

	return <LearnersTable learners={learners} />;
};

const Page = async ({
	params: { courseId, teamId },
}: {
	params: { courseId: string; teamId: string };
}) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/dashboard");
	}

	return (
		<main>
			<div className="flex items-center justify-between">
				<div>
					<h2>Learners</h2>
					<p className="text-muted-foreground">
						View and manage this courses learners
					</p>
				</div>
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
				<Table courseId={courseId} />
			</Suspense>
		</main>
	);
};

export default Page;
