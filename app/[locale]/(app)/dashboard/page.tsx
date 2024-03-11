import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { getCourses } from "@/server/actions/actions";
import { Plus } from "lucide-react";

const Page = async () => {
	const { data: courses } = await getCourses(undefined);

	return (
		<>
			<div className="mb-12 flex w-full items-center justify-between">
				<h1>Courses</h1>
			</div>
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
				{courses?.map((course) => (
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
		</>
	);
};

export default Page;
