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
import { getAuth } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { unstable_noStore } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteModule from "./DeleteModule";

const Page = async ({
	params,
}: {
	params: Promise<{ courseId: string; teamId: string }>;
}) => {
	const { courseId, teamId } = await params;
	unstable_noStore();
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const course = await await db.query.courses.findFirst({
		where: and(eq(courses.id, courseId), eq(courses.teamId, teamId)),
		with: {
			modules: {
				with: {
					learners: true,
				},
			},
		},
	});

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
						<TableHead>Version Number</TableHead>
						<TableHead>Learners</TableHead>
						<TableHead></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{course?.modules
						.sort((a, b) => (b.language === "fr" ? -1 : 1))
						.sort((a, b) => b.versionNumber - a.versionNumber)
						.map((module) => (
							<TableRow key={module.id}>
								<TableCell>{module.id}</TableCell>
								<TableCell>{module.type}</TableCell>
								<TableCell>
									{module.language === "fr"
										? "Francais"
										: "English"}
								</TableCell>
								<TableCell>{module.versionNumber}</TableCell>
								<TableCell>{module.learners.length}</TableCell>
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
