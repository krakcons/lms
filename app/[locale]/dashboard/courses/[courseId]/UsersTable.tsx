"use client";

import { trpc } from "@/app/[locale]/_trpc/client";
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
import { ExpandedLearner } from "@/types/learner";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

const columnHelper = createColumnHelper<ExpandedLearner>();

const LearnerActions = ({
	learner: { id, courseId },
}: {
	learner: ExpandedLearner;
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

const columns = [
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
