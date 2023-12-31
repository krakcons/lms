"use client";

import { trpc } from "@/app/[locale]/_trpc/client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Learner } from "@/types/learner";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

const LearnerActions = ({
	learner: { id, courseId },
}: {
	learner: Learner;
}) => {
	const router = useRouter();
	const { mutate } = trpc.learner.delete.useMutation({
		onSuccess: () => {
			router.refresh();
		},
	});

	return (
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
				<DropdownMenuItem
					className="cursor-pointer"
					onSelect={() =>
						mutate({
							id,
							courseId,
						})
					}
				>
					Remove Learner
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LearnerActions;
