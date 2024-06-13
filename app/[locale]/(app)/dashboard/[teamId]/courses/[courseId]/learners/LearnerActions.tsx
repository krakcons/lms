"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { Learner } from "@/types/learner";
import { useMutation } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ReinviteDialog } from "./LearnersTable";

const LearnerActions = ({ learner }: { learner: Learner }) => {
	const router = useRouter();
	const { mutate: deleteLearner } = useMutation({
		mutationFn: client.api.learners[":id"].$delete,
		onSuccess: () => {
			router.refresh();
		},
	});

	const { mutate: resendCertificate } = useMutation({
		mutationFn: client.api.learners[":id"].recertify.$post,
		onSuccess: () => {
			router.refresh();
			toast.success("Certificate resent");
		},
	});

	return (
		<ReinviteDialog learner={learner}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DialogTrigger asChild>
						<DropdownMenuItem className="cursor-pointer">
							Reinvite
						</DropdownMenuItem>
					</DialogTrigger>
					{learner.completedAt && (
						<DropdownMenuItem
							className="cursor-pointer"
							onSelect={() => {
								resendCertificate({
									param: { id: learner.id },
								});
							}}
						>
							Resend Certificate
						</DropdownMenuItem>
					)}
					<DropdownMenuItem
						className="cursor-pointer text-red-500 focus:text-red-500"
						onSelect={() =>
							deleteLearner({
								param: { id: learner.id },
							})
						}
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</ReinviteDialog>
	);
};

export default LearnerActions;
