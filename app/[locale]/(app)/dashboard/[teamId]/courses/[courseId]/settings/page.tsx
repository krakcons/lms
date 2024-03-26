import { Separator } from "@/components/ui/separator";
import DeleteCourseDialog from "./DeleteCourseDialog";

const Page = ({ params: { courseId } }: { params: { courseId: string } }) => {
	return (
		<main>
			<h2>Settings</h2>
			<p className="text-muted-foreground">Manage your course settings</p>
			<Separator className="my-8" />
			<h4 className="mb-4">Danger Zone</h4>
			<DeleteCourseDialog courseId={courseId} />
		</main>
	);
};

export default Page;
