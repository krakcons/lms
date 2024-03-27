import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getAuth } from "@/server/actions/cached";
import { coursesData } from "@/server/db/courses";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteModule from "./DeleteModule";

const Page = async ({
	params: { courseId, teamId },
}: {
	params: { courseId: string; teamId: string };
}) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const course = await coursesData.getCourseWithModules(
		{ id: courseId },
		user.id
	);

	return (
		<main>
			<div className="flex items-center justify-between">
				<div>
					<h2>Modules</h2>
					<p className="text-muted-foreground">
						Create and manage your course modules
					</p>
				</div>
				<Link
					href={`/dashboard/${teamId}/courses/${courseId}/modules/create`}
					className={buttonVariants({
						variant: "outline",
					})}
				>
					Add Module
				</Link>
			</div>
			<Separator className="my-8" />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Id</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Language</TableHead>
						<TableHead></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{course?.modules.map((module) => (
						<TableRow key={module.id}>
							<TableCell>{module.id}</TableCell>
							<TableCell>{module.type}</TableCell>
							<TableCell>
								{module.language === "fr"
									? "Francais"
									: "English"}
							</TableCell>
							<TableCell>
								<DeleteModule moduleId={module.id} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
				{!course?.modules && <TableCaption>No files yet.</TableCaption>}
			</Table>
		</main>
	);
};

export default Page;
