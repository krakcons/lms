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
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const Page = () => {
	const { teamId } = useParams<{ teamId: string }>();
	const router = useRouter();
	const deleteMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.teams[":id"].$delete({
				param: { id: teamId },
			});
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			router.push("/dashboard");
		},
	});

	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>Danger</h2>
					<p className="text-muted-foreground">
						Only proceed if you know what you are doing
					</p>
				</div>
			</div>
			<Separator className="my-8" />
			<AlertDialog>
				<AlertDialogTrigger
					className={buttonVariants({ variant: "destructive" })}
				>
					Delete Team
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone and will permanently
							all courses, learners and data associated with this
							team.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								deleteMutation.mutate();
							}}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default Page;
