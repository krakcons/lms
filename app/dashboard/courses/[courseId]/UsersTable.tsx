"use client";

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
import { CourseUserWithExpandedData } from "@/lib/users";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { deleteCourseUser } from "../../actions";

const columnHelper = createColumnHelper<CourseUserWithExpandedData>();

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
			const courseUser = row.original;

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
							onClick={async () =>
								await deleteCourseUser({
									courseId: courseUser.courseId,
									courseUserId: courseUser.id,
								})
							}
							className="cursor-pointer"
						>
							Delete User
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	}),
];

type Props = {
	expandedUsers: CourseUserWithExpandedData[];
};

const UsersTable = ({ expandedUsers }: Props) => {
	return (
		<DataTable
			data={expandedUsers}
			columns={columns}
			options={{
				filter: {
					column: "email",
					placeholder: "Search emails...",
				},
			}}
		/>
	);
};

export default UsersTable;
