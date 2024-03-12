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
import { useToast } from "@/components/ui/use-toast";
import { createLearner } from "@/server/actions/actions";
import { CreateLearner, CreateLearnerSchema } from "@/types/learner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const InviteLearnerForm = ({
	close,
	courseId,
}: {
	close: () => void;
	courseId: string;
}) => {
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: createLearner,
		onSuccess: (_, { email }) => {
			router.refresh();
			toast({
				title: "Successfully Invited",
				description: `User ${email} has been sent an invitation to join this course.`,
			});
			close();
			form.reset();
		},
		onError: (err) => {
			form.setError("root", {
				type: "server",
				message: err.message,
			});
			toast({
				title: "Something went wrong!",
				description: err.message,
				variant: "destructive",
			});
		},
	});
	const { toast } = useToast();
	const form = useForm<CreateLearner>({
		resolver: zodResolver(CreateLearnerSchema),
		defaultValues: {
			email: "",
			sendEmail: true,
			id: undefined,
			courseId,
		},
	});

	const onSubmit = async (input: CreateLearner) => {
		mutate(input);
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
					<Button type="submit">
						{isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Submit
					</Button>
				</form>
			</Form>
		</DialogContent>
	);
};

export default InviteLearnerForm;
