"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { Learner } from "@/types/learner";
import { useMutation } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

const LearnerActions = ({ learner: { id } }: { learner: Learner }) => {
	const { mutate } = useMutation({
		mutationFn: api.api.learners[":id"].$delete,
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
							param: { id },
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
