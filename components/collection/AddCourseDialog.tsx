"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { Course } from "@/types/course";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export const AddCourseDialog = ({
	collectionId,
	courses,
}: {
	collectionId: string;
	courses: Course[];
}) => {
	const router = useRouter();
	const { mutate } = useMutation({
		mutationFn: client.api.collections[":id"].courses.$post,
		onSuccess: async () => {
			router.refresh();
		},
	});

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex h-32 flex-col">
					<div className="flex flex-col items-center justify-center gap-4">
						<Plus size={24} />
						Add Course
					</div>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-screen overflow-y-auto">
				<DialogTitle>Add Course</DialogTitle>
				{courses.length === 0 && (
					<p className="mt-4 text-center text-muted-foreground">
						No courses available to add.
					</p>
				)}
				<div className="grid grid-cols-2 gap-4">
					{courses.map((course) => (
						<Button
							key={course.id}
							variant="outline"
							className="relative h-32 w-full gap-4 p-4"
							onClick={() => {
								mutate({
									param: { id: collectionId },
									json: { id: course.id },
								});
							}}
						>
							<p className="truncate text-center">
								{course.name}
							</p>
							<Badge variant="outline" className="absolute top-2">
								Free
							</Badge>
						</Button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
};