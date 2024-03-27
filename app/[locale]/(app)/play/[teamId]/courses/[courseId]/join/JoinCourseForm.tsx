"use client";

import { Button } from "@/components/ui/button";
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

export const JoinCourseForm = ({
	courseId,
	moduleId,
	teamId,
	text,
}: {
	moduleId: string;
	courseId: string;
	teamId: string;
	text: {
		firstName: string;
		lastName: string;
		email: string;
		submit: string;
		guest: string;
	};
}) => {
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		mutationFn: client.api.modules[":id"].learners.$post,
		onSuccess: async (res) => {
			const data = await res.json();
			router.push(
				`/play/${teamId}/courses/${courseId}?learnerId=${data?.id}`
			);
		},
		onError: (err) => {
			form.setError("root", {
				type: "server",
				message: err.message,
			});
			toast("Something went wrong!", {
				description: err.message,
			});
		},
	});

	const form = useForm<CreateLearner>({
		resolver: zodResolver(CreateLearnerSchema),
		defaultValues: {
			email: "",
			moduleId,
			sendEmail: false,
			firstName: "",
			lastName: "",
		},
	});

	const onSubmit = async (input: CreateLearner) => {
		mutate({ param: { id: moduleId }, json: input });
	};

	return (
		<Form {...form}>
			<form className="space-y-4">
				{form.formState.errors.root?.message && (
					<FormError message={form.formState.errors.root.message} />
				)}
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{text.firstName}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{text.lastName}</FormLabel>
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
							<FormLabel>{text.email}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex gap-3">
					<Button
						type="submit"
						onClick={form.handleSubmit(onSubmit)}
						isPending={form.formState.isSubmitted && isPending}
					>
						{text.submit}
					</Button>
				</div>
			</form>
		</Form>
	);
};
