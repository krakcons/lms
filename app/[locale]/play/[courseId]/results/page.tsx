import { serverTrpc } from "@/app/[locale]/_trpc/server";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { scoreLabel, statusLabels } from "@/lib/learner";
import { Link, redirect } from "@/lib/navigation";

const Page = async ({
	params: { courseId },
	searchParams: { learnerId },
}: {
	params: { courseId: string };
	searchParams: { learnerId?: string };
}) => {
	if (!learnerId) {
		return redirect(`/play/${courseId}/public`);
	}

	const restartCourse = async () => {
		"use server";
		await serverTrpc.learner.reset({
			id: learnerId,
			courseId,
		});
		redirect(`/play/${courseId}?learnerId=${learnerId}`);
	};

	const learner = await serverTrpc.learner.findOne({
		id: learnerId,
		courseId,
	});

	return (
		<main className="m-auto flex flex-col">
			<Card>
				<CardHeader>
					<CardTitle>Your Results</CardTitle>
					<CardDescription>
						Continue or view all your current courses.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col">
						<p className="font-bold">Score</p>
						<p>{scoreLabel(learner.score)}</p>
						<p className="mt-3 font-bold">Status</p>
						<p>{statusLabels[learner.status]}</p>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between gap-3">
					<Link
						href={`/play/${courseId}?learnerId=${learnerId}`}
						className={buttonVariants({
							variant: "outline",
						})}
					>
						Continue
					</Link>
					<Link href="/dashboard" className={buttonVariants()}>
						View All Results
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
};

export default Page;
