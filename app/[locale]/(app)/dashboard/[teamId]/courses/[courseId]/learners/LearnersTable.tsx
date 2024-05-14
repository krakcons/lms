"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { locales } from "@/i18n";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { Learner } from "@/types/learner";
import { Language } from "@/types/translations";
import { useMutation } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import LearnerActions from "./LearnerActions";

const columnHelper = createColumnHelper<Learner & { language?: Language }>();

export const ReinviteDialog = ({
	learner,
	children,
}: {
	learner: Learner;
	children: React.ReactNode;
}) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const { mutate: reinviteLearner, isPending } = useMutation({
		mutationFn: client.api.learners[":id"].reinvite.$post,
		onSuccess: () => {
			router.refresh();
			setOpen(false);
			toast.success("Learner reinvited");
		},
	});

	const form = useForm<{
		inviteLanguage: Language;
	}>({
		defaultValues: {
			inviteLanguage: "en",
		},
	});

	const onSubmit = (values: { inviteLanguage: Language }) => {
		reinviteLearner({
			param: {
				id: learner.id,
			},
			json: {
				inviteLanguage: values.inviteLanguage,
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reinvite Learner</DialogTitle>
					<DialogDescription>
						Modify the language and press the button to reinvite the
						learner
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex justify-end gap-2"
					>
						<FormField
							control={form.control}
							name="inviteLanguage"
							render={({ field }) => (
								<FormItem>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-[80px]">
												<SelectValue placeholder="Select language" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectGroup>
												{locales.map((locale) => (
													<SelectItem
														key={locale}
														value={locale}
													>
														{locale}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" isPending={isPending}>
							Reinvite
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

const StatusCell = ({ info }: { info: { row: { original: Learner } } }) => {
	const status = info.row.original.status;
	const router = useRouter();

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
				<ReinviteDialog learner={info.row.original}>
					<DialogTrigger asChild>
						<Button variant="outline">Reinvite</Button>
					</DialogTrigger>
				</ReinviteDialog>
			</div>
		);
	}
	return labels[status];
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
		(row) =>
			row.startedAt?.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}) || "N/A",
		{
			header: "Started At",
		}
	),
	columnHelper.accessor<(row: Learner) => string, string>(
		(row) =>
			row.completedAt?.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}) || "N/A",
		{
			header: "Completed At",
		}
	),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => <StatusCell info={info} />,
	}),
	columnHelper.accessor<
		(
			row: Learner & {
				language?: Language;
			}
		) => string,
		string
	>((row) => row.language ?? "", {
		header: "Language",
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

const LearnersTable = ({
	learners,
}: {
	learners: (Learner & { language?: Language })[];
}) => {
	return (
		<DataTable
			data={learners}
			columns={columns as any}
			name={"Learners"}
			filter={{
				column: "email",
				placeholder: "Search emails...",
			}}
		/>
	);
};

export default LearnersTable;
