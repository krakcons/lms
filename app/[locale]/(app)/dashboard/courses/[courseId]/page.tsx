import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCourse } from "@/server/actions/course";
import { getLearners } from "@/server/actions/learner";
import { EyeOff, Users } from "lucide-react";
import { notFound } from "next/navigation";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const { data: course } = await getCourse({ id: courseId });
	const { data: learners = [] } = await getLearners({ courseId });

	if (!course) {
		return notFound();
	}

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
