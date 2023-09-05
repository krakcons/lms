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
import { parseCourseUserData } from "@/lib/scorm";
import { Course } from "@/types/course";
import { CourseUser } from "@/types/courseUser";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { deleteCourseUser } from "../../actions";

const columnHelper = createColumnHelper<
	CourseUser & { version: Course["version"] }
>();

export const columns = [
	columnHelper.accessor("id", {
		header: "Course User Id",
	}),
	columnHelper.accessor("email", {
		header: "User",
	}),
	columnHelper.accessor("data", {
		header: "Status",
		cell: (info) => {
			return parseCourseUserData(
				info.row.original.data,
				info.row.original.version
			).status;
		},
	}),
	columnHelper.accessor("data", {
		header: "Score",
		cell: (info) => {
			const score = parseCourseUserData(
				info.row.original.data,
				info.row.original.version
			).score;

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
