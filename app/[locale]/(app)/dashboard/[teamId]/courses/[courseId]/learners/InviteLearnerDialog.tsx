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
	FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { labelVariants } from "@/components/ui/label";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { CreateLearnerSchema } from "@/types/learner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const InviteFormSchema = z.object({
	learners: z.array(CreateLearnerSchema),
});
type InviteForm = z.infer<typeof InviteFormSchema>;

const InviteLearnerDialog = ({ courseId }: { courseId: string }) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: client.api.courses[":id"].learners.$post,
		onSuccess: () => {
			router.refresh();
			toast("Successfully Invited", {
				description: `User has been sent an invitation to join this course.`,
			});
			setOpen(false);
			form.reset();
		},
		onError: (err) => {
			form.setError("root", {
				type: "server",
				message: err.message,
			});
			toast.error("Something went wrong!", {
				description: err.message,
			});
		},
	});

	const form = useForm<InviteForm>({
		resolver: zodResolver(InviteFormSchema),
		defaultValues: {
			learners: [
				{
					email: "",
					firstName: "",
					lastName: "",
					sendEmail: true,
					id: undefined,
					courseId,
				},
			],
		},
	});

	const onSubmit = async (input: InviteForm) => {
		mutate({
			param: {
				id: courseId,
			},
			json: input.learners,
		});
	};

	const { fields, append, remove } = useFieldArray({
		name: "learners",
		control: form.control,
	});

	console.log(fields);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus size={18} />
					Invite Learner
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Invite learners</DialogTitle>
					<DialogDescription>
						Enter an email and name below.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{form.formState.errors.root?.message && (
							<FormError
								message={form.formState.errors.root.message}
							/>
						)}
						<div className="flex w-full gap-2">
							<p
								className={labelVariants({
									className: "flex-1",
								})}
							>
								First Name
							</p>
							<p
								className={labelVariants({
									className: "flex-1",
								})}
							>
								Last Name
							</p>
							<p
								className={labelVariants({
									className: "flex-[2]",
								})}
							>
								Email
							</p>
							<div className="w-10"></div>
						</div>
						<hr />
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="flex items-end gap-2"
							>
								<FormField
									control={form.control}
									name={`learners.${index}.firstName`}
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`learners.${index}.lastName`}
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`learners.${index}.email`}
									render={({ field }) => (
										<FormItem className="flex-[2]">
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="button"
									onClick={() => remove(index)}
									variant="outline"
									size="icon"
									className="min-w-10"
								>
									<Trash2 size={18} />
								</Button>
							</div>
						))}
						<div className="flex justify-between">
							<Button
								type="button"
								onClick={() =>
									append({
										email: "",
										firstName: "",
										lastName: "",
										sendEmail: true,
										id: undefined,
										courseId,
									})
								}
								variant="outline"
							>
								Add Learner
							</Button>
							<Button type="submit" isPending={isPending}>
								Invite
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default InviteLearnerDialog;
