"use client";

import { Button } from "@/components/ui/button";
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
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { client } from "@/lib/api";
import { InviteMemberForm, InviteMemberFormSchema } from "@/types/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const AddMemberDialog = ({ teamId }: { teamId: string }) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const form = useForm<InviteMemberForm>({
		resolver: zodResolver(InviteMemberFormSchema),
		defaultValues: {
			email: "",
			role: "member",
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async (input: InviteMemberForm) => {
			const res = await client.api.teams[":id"].invite.$post({
				param: { id: teamId },
				json: input,
			});
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			router.refresh();
			setOpen(false);
			form.reset();
		},
		onError: (err) => {
			form.setError("email", {
				type: "server",
				message: err.message,
			});
		},
	});

	const onSubmit = async (input: InviteMemberForm) => {
		mutate(input);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus size={20} />
					Add member
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Team Member</DialogTitle>
					<DialogDescription>
						Make sure you trust the person you are inviting and they
						have an account.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-[200px]">
												<SelectValue placeholder="Select Role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="member">
													Member
												</SelectItem>
												<SelectItem value="owner">
													Owner
												</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" isPending={isPending}>
							Submit
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
