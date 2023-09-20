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
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpandedLearner } from "@/lib/learner";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { deleteLearner } from "../../actions";

const columnHelper = createColumnHelper<ExpandedLearner>();

const columns = [
	columnHelper.accessor("email", {
		header: "Email",
	}),
	columnHelper.accessor("status", {
		header: "Status",
	}),
	columnHelper.display({
		header: "Score",
		cell: (info) => {
			const score = info.row.original.score;

			if (score && score.max && score.raw) {
				return `${score.raw}/${score.max}`;
			} else {
				return "N/A";
			}
		},
	}),
	columnHelper.display({
		id: "actions",
		header: "",
		cell: ({ row }) => {
			const learner = row.original;

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
						<AlertDialog>
							<AlertDialogTrigger>
								<DropdownMenuItem
									className="cursor-pointer"
									onSelect={(e) => e.preventDefault()}
								>
									Remove Learner
								</DropdownMenuItem>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Are you absolutely sure?
									</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This
										action will permanently delete this user
										and all their data.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={async () =>
											await deleteLearner({
												courseId: learner.courseId,
												learnerId: learner.id,
											})
										}
									>
										Continue
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	}),
];

type Props = {
	expandedLearners: ExpandedLearner[];
};

const UsersTable = ({ expandedLearners }: Props) => {
	return (
		<DataTable
			data={expandedLearners}
			columns={columns}
			filter={{
				column: "email",
				placeholder: "Search emails...",
			}}
		/>
	);
};

export default UsersTable;
