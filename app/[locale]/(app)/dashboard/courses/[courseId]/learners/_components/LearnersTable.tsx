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
import { useRouter } from "@/lib/navigation";
import { deleteLearner, reinviteLearner } from "@/server/actions/learner";
import { Learner } from "@/types/learner";
import { useMutation } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

const columnHelper = createColumnHelper<Learner>();

const StatusCell = ({ info }: { info: { row: { original: Learner } } }) => {
	const [reinvited, setReinvited] = useState(false);
	const status = info.row.original.status;

	const labels = {
		"not-started": "Not Started",
		"in-progress": "In Progress",
		passed: "Passed",
		failed: "Failed",
	};

	if (info.row.original.status === "not-started" && info.row.original.email) {
		return (
			<div className="flex items-center gap-4">
				<p className="text-sm">Invited</p>
				<Button
					onClick={() => {
						if (reinvited) return;
						setReinvited(true);
						reinviteLearner({
							id: info.row.original.id,
							courseId: info.row.original.courseId,
						});
					}}
					variant={"outline"}
					size={"sm"}
				>
					{reinvited ? "Reinvited" : "Reinvite"}
				</Button>
			</div>
		);
	}
	return <p>{labels[status]}</p>;
};

const LearnerActions = ({
	learner: { id, courseId },
}: {
	learner: Learner;
}) => {
	const router = useRouter();
	const { mutate } = useMutation({
		mutationFn: deleteLearner,
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

const columns = [
	columnHelper.accessor("id", {
		header: "ID",
	}),
	columnHelper.accessor("email", {
		header: "Email",
		cell: (info) => {
			if (info.row.original.email) {
				return info.row.original.email;
			} else {
				return "Anonymous";
			}
		},
	}),
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
