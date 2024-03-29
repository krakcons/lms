import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { redirect } from "@/lib/navigation";
import { getAuth } from "@/server/auth/actions";
import { coursesData } from "@/server/db/courses";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { eq } from "drizzle-orm";

import { Users } from "lucide-react";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const course = await coursesData.get({ id: courseId }, user.id);

	const learnerList = await db.query.learners.findMany({
		where: eq(learners.courseId, courseId),
	});

	return (
		<main>
			<h2>{course.name}</h2>
			<p className="text-muted-foreground">{course.description}</p>
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
							{learnerList.length}
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
};

export default Page;
