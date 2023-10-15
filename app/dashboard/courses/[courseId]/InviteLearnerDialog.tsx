"use client";

import { trpc } from "@/app/_trpc/client";
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
	FormError,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { CreateLearner, CreateLearnerSchema } from "@/types/learner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const InviteLearnerDialog = ({ courseId }: { courseId: string }) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const { mutate, isLoading } = trpc.learner.create.useMutation({
		onSuccess: ({ email }) => {
			router.refresh();
			toast({
				title: "Successfully Invited",
				description: `User ${email} has been sent an invitation to join this course.`,
			});
			setOpen(false);
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon">
									<UserPlus />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>Invite Learner</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</DialogTrigger>
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
							{isLoading && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Submit
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default InviteLearnerDialog;
