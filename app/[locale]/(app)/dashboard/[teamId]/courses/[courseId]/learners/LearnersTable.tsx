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
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { Learner } from "@/types/learner";
import { useMutation } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

const columnHelper = createColumnHelper<Learner>();

const StatusCell = ({ info }: { info: { row: { original: Learner } } }) => {
	const status = info.row.original.status;
	console.log("status", status);

	const labels = {
		completed: "Completed",
		"not-started": "Not Started",
		"in-progress": "In Progress",
		passed: "Passed",
		failed: "Failed",
	};

	if (info.row.original.startedAt === null) {
		return (
			<div className="flex items-center gap-4">
				<p className="text-sm">Invited</p>
			</div>
		);
	}
	return labels[status];
};

const LearnerActions = ({ learner: { id } }: { learner: Learner }) => {
	const router = useRouter();
	const { mutate } = useMutation({
		mutationFn: client.api.learners[":id"].$delete,
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

const columns = [
	columnHelper.accessor("id", {
		header: "ID",
	}),
	columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
		id: "fullName",
		header: "Name",
	}),
	columnHelper.accessor("email", {
		header: "Email",
	}),
	columnHelper.accessor<(row: Learner) => string, string>(
		(row) => row.startedAt?.toString() || "N/A",
		{
			header: "Started At",
		}
	),
	columnHelper.accessor<(row: Learner) => string, string>(
		(row) => row.completedAt?.toString() || "N/A",
		{
			header: "Completed At",
		}
	),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => <StatusCell info={info} />,
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

			return <LearnerActions learner={learner} />;
		},
	}),
];

const LearnersTable = ({ learners }: { learners: Learner[] }) => {
	return (
		<DataTable
			data={learners}
			columns={columns}
			name={"Learners"}
			filter={{
				column: "email",
				placeholder: "Search emails...",
			}}
		/>
	);
};

export default LearnersTable;
