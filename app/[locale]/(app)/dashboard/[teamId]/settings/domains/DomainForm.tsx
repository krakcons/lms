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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { env } from "@/env.mjs";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { Team, validDomainSchema } from "@/types/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const DomainFormSchema = z.object({
	customDomain: validDomainSchema,
});
export type DomainForm = z.infer<typeof DomainFormSchema>;

const updateDomainFn = client.api.teams[":id"].domain.$put;
const deleteDomainFn = client.api.teams[":id"].domain.$delete;

const DomainForm = ({ team }: { team: Team }) => {
	const router = useRouter();
	const form = useForm<DomainForm>({
		resolver: zodResolver(DomainFormSchema),
		defaultValues: {
			customDomain: team.customDomain || "",
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async (input: InferRequestType<typeof updateDomainFn>) => {
			const res = await updateDomainFn(input);
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			toast("Successfully updated domain");
			router.refresh();
		},
	});

	const { mutate: deleteDomain } = useMutation({
		mutationFn: async (input: InferRequestType<typeof deleteDomainFn>) => {
			const res = await deleteDomainFn(input);
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			toast("Successfully deleted domain");
			form.reset({ customDomain: "" });
			router.refresh();
		},
	});

	const onSubmit = async ({ customDomain }: DomainForm) => {
		mutate({
			param: { id: team.id },
			json: { customDomain },
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="customDomain"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Custom Domain</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter domain in format (example.com)"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex gap-3">
					<Button type="submit" isPending={isPending}>
						Submit
					</Button>
					{team.customDomain && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">Delete</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Are you sure you want to delete this
										domain?
									</AlertDialogTitle>
									<AlertDialogDescription>
										Any previous invites and links with your
										custom domain will no longer work. Your
										domain will be reset to the default
										domain ({env.NEXT_PUBLIC_SITE_URL})
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => {
											deleteDomain({
												param: { id: team.id },
											});
										}}
									>
										Continue
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>
			</form>
		</Form>
	);
};

export default DomainForm;
