"use client";

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
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = {
	courseId: string;
};

const DeleteCourseDialog = ({ courseId }: Props) => {
	const router = useRouter();

	const { mutate } = useMutation({
		mutationFn: client.api.courses[":id"].$delete,
		onSuccess: () => {
			router.push("/dashboard");
			router.refresh();
		},
		onError: (error) => {
			toast.error("Something went wrong!", {
				description: error.message,
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
								param: { id: courseId },
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
