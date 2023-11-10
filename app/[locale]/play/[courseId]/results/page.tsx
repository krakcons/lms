import { serverTrpc } from "@/app/[locale]/_trpc/server";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Your Results</CardTitle>
					<CardDescription>
						Congratulations! You have completed the course.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col">
						<p className="font-bold">Score</p>
						<p>{`${learner.score?.raw}/${learner.score?.max}`}</p>
						<p className="mt-3 font-bold">Final Status</p>
						<p>{learner.status}</p>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline" onClick={restartCourse}>
						Restart
					</Button>
					<Link href="/dashboard" className={buttonVariants()}>
						View All Results
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
};

export default Page;
