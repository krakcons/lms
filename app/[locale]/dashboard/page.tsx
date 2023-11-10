import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { statusLabels } from "@/lib/learner";
import { Link } from "@/lib/navigation";
import { Plus } from "lucide-react";
import { serverTrpc } from "../_trpc/server";

const Page = async () => {
	const courses = await serverTrpc.course.find();
	const user = await serverTrpc.user.me();

	console.log(user.learnings);

	return (
		<div className="flex flex-col gap-8">
			{user.learnings.length && <h2>My Learning</h2>}
			{user.learnings.map((learning) => (
				<Link
					href={`/play/${learning.courseId}?learnerId=${learning.id}`}
					key={learning.id}
					target="_blank"
					className={buttonVariants({
						variant: "outline",
						className: "justify-between",
					})}
				>
					{learning.course?.name}
					<span className="flex gap-3">
						{learning.score && (
							<Badge>
								{learning.score.raw}/{learning.score.max}
							</Badge>
						)}
						<Badge>{statusLabels[learning.status]}</Badge>
					</span>
				</Link>
			))}
			<h2>Courses</h2>
			<div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Link
					href={"/dashboard/upload"}
					className={buttonVariants({
						variant: "outline",
						className: "flex h-56 flex-col",
					})}
				>
					<div className="flex flex-col items-center justify-center gap-4">
						<Plus size={24} />
						Create Course
					</div>
				</Link>
				{courses.map((course) => (
					<Link
						href={`/dashboard/courses/${course.id}`}
						key={course.id}
						className={buttonVariants({
							variant: "outline",
							className: "relative flex h-56 flex-col gap-4",
						})}
					>
						<p className="text-center text-lg">{course.name}</p>
						<Badge variant="outline" className="absolute top-3">
							Free
						</Badge>
					</Link>
				))}
			</div>
		</div>
	);
};

export default Page;
