import { AddCourseDialog } from "@/components/collection/AddCourseDialog";
import { CollectionDeleteButton } from "@/components/collection/CollectionDeleteButton";
import { CollectionLearnerInvite } from "@/components/collection/CollectionLearnerInvite";
import { CreateCollectionDialog } from "@/components/collection/CreateCollectionDialog";
import { EditCollectionForm } from "@/components/collection/EditCollectionDialog";
import RemoveCourseButton from "@/components/collection/RemoveCourseButton";
import { CreateCourseForm } from "@/components/course/CreateCourseForm";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Link, redirect } from "@/lib/navigation";
import { translate } from "@/lib/translation";
import { getAuth, getTeam } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";

const Page = async ({
	params,
}: {
	params: Promise<{ teamId: string; locale: Language }>;
}) => {
	const { teamId, locale } = await params;
	const { user } = await getAuth();
	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/dashboard");
	}

	const courseList = await db.query.courses.findMany({
		where: eq(courses.teamId, team.id),
		with: {
			translations: true,
		},
	});

	const collections = await db.query.collections.findMany({
		where: eq(courses.teamId, team.id),
		with: {
			translations: true,
			collectionsToCourses: {
				with: {
					course: {
						with: {
							translations: true,
						},
					},
				},
			},
		},
	});

	return (
		<>
			<h1 className="mb-6">Courses</h1>
			<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{courseList?.map((course) => (
					<Link
						href={`/dashboard/${teamId}/courses/${course.id}/learners`}
						key={course.id}
						className={buttonVariants({
							variant: "outline",
							className: "relative h-32 w-full gap-4 p-4",
						})}
					>
						<p className="truncate text-center">
							{translate(course.translations, locale).name}
						</p>
					</Link>
				))}
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							className="flex h-32 flex-col"
						>
							<div className="flex flex-col items-center justify-center gap-4">
								<Plus size={24} />
								Create Course
							</div>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>Create Course</DialogTitle>
						<CreateCourseForm
							teamId={teamId}
							language={locale as Language}
						/>
					</DialogContent>
				</Dialog>
			</div>
			<h1 className="mb-6 mt-12">Collections</h1>
			<div className="flex flex-col gap-8">
				{collections?.map((collection) => (
					<div
						key={collection.id}
						className="flex flex-col gap-4 rounded-xl border border-blue-400 p-3"
					>
						<div className="flex items-center justify-between">
							<div className="flex flex-col gap-1">
								<p className="text-lg font-semibold text-blue-300">
									{
										translate(
											collection.translations,
											locale
										).name
									}
								</p>
								<p className="text-sm text-muted-foreground opacity-90">
									{
										translate(
											collection.translations,
											locale
										).description
									}
									{translate(collection.translations, locale)
										.description && " "}
									{`(id: ${collection.id})`}
								</p>
							</div>
							<div className="flex gap-3">
								<CollectionDeleteButton
									collectionId={collection.id}
								/>
								<EditCollectionForm
									translations={collection.translations}
									collectionId={collection.id}
									language={locale}
								/>
								<CollectionLearnerInvite
									collectionId={collection.id}
								/>
							</div>
						</div>
						<div className="flex flex-col">
							<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ">
								{collection.collectionsToCourses?.map(
									({ course }) => (
										<div
											className="relative"
											key={course.id}
										>
											<Link
												href={`/dashboard/${teamId}/courses/${course.id}/learners`}
												className={buttonVariants({
													variant: "outline",
													className:
														"relative h-32 w-full gap-4 p-4",
												})}
											>
												<p className="truncate text-center">
													{
														translate(
															course.translations,
															locale
														).name
													}
												</p>
											</Link>
											<RemoveCourseButton
												collectionId={collection.id}
												courseId={course.id}
											/>
										</div>
									)
								)}

								<AddCourseDialog
									collectionId={collection.id}
									courses={courseList.filter(
										(course) =>
											!collection.collectionsToCourses?.find(
												({ course: c }) =>
													c.id === course.id
											)
									)}
									language={locale}
								/>
							</div>
						</div>
					</div>
				))}
				<CreateCollectionDialog language={locale} />
			</div>
		</>
	);
};

export default Page;
