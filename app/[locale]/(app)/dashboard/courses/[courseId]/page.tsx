import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { redirect } from "@/lib/navigation";
import { getAuth } from "@/server/actions/cached";
import { getCourse } from "@/server/db/courses";
import { getLearners } from "@/server/db/learners";
import { LCDSError } from "@/server/errors";

import { EyeOff, Users } from "lucide-react";
import { notFound } from "next/navigation";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	let course;
	try {
		course = await getCourse({ id: courseId }, user.id);
	} catch (error) {
		if (error instanceof LCDSError && error.code === "NOT_FOUND") {
			return notFound();
		}
		throw error;
	}

	const learners = await getLearners({ courseId }, user.id);

	return (
		<main>
			<h2>{course.name}</h2>
			<p className="text-muted-foreground">View course overview</p>
			<Separator className="my-8" />
			<div className="flex justify-between gap-4">
				<Card className="flex-1">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Learners
						</CardTitle>
						<Users size={20} className="text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{learners.length}
						</div>
					</CardContent>
				</Card>
				<Card className="flex-1">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Anonymous Learners
						</CardTitle>
						<EyeOff size={19} className="text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{
								learners.filter((learner) => !learner.email)
									.length
							}
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
};

export default Page;
