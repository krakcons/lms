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
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { LearnerInvite, LearnerInviteSchema } from "@/types/learner";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { inviteLearner } from "../../actions";

const InviteLearnerDialog = ({ courseId }: { courseId: string }) => {
	const [open, setOpen] = useState(false);
	const { toast } = useToast();
	const form = useForm<LearnerInvite>({
		resolver: zodResolver(LearnerInviteSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async ({ email }: LearnerInvite) => {
		inviteLearner({
			courseId,
			email,
		})
			.then(() => {
				toast({
					title: "Successfully Invited",
					description: `User ${email} has been sent an invitation to join this course.`,
				});
				setOpen(false);
			})
			.catch((err) => {
				toast({
					title: "Uh oh! Something went wrong.",
					description: err.message,
					variant: "destructive",
				});
			});
		form.reset();
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
						className="space-y-8"
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
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default InviteLearnerDialog;
