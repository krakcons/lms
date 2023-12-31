"use client";

import { trpc } from "@/app/[locale]/_trpc/client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

type Props = {
	courseId: string;
};

const DeleteCourseDialog = ({ courseId }: Props) => {
	const router = useRouter();

	const { mutate } = trpc.course.delete.useMutation({
		onSuccess: () => {
			router.push("/dashboard");
			router.refresh();
		},
		onError: (error) => {
			toast({
				title: "Something went wrong!",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger
				className={buttonVariants({ variant: "destructive" })}
			>
				Delete Course
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This action will
						permanently this course and all its users.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() =>
							mutate({
								id: courseId,
							})
						}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteCourseDialog;
