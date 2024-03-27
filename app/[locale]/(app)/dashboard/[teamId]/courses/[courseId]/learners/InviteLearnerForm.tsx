"use client";

import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { CreateLearner, CreateLearnerSchema } from "@/types/learner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const InviteLearnerForm = ({
	close,
	moduleId,
}: {
	close: () => void;
	moduleId: string;
}) => {
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: client.api.modules[":id"].learners.$post,
		onSuccess: () => {
			router.refresh();
			toast("Successfully Invited", {
				description: `User has been sent an invitation to join this course.`,
			});
			close();
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
	const form = useForm<CreateLearner>({
		resolver: zodResolver(CreateLearnerSchema),
		defaultValues: {
			email: "",
			sendEmail: true,
			id: undefined,
			moduleId,
		},
	});

	const onSubmit = async (input: CreateLearner) => {
		mutate({
			param: {
				id: moduleId,
			},
			json: input,
		});
	};

	return (
		<DialogContent className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Invite user</DialogTitle>
				<DialogDescription>
					Enter an email below to invite a user to this course.
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
					<FormField
						control={form.control}
						name="id"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Identifier
									<span className="text-muted-foreground">
										{" (Optional)"}
									</span>
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input autoFocus={true} {...field} />
								</FormControl>
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
	);
};

export default InviteLearnerForm;
