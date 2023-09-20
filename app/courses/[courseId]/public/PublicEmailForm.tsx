"use client";

import { trpc } from "@/app/_trpc/client";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const InputSchema = z.object({
	email: z.string().email(),
});
type Input = z.infer<typeof InputSchema>;

const PublicEmailForm = ({ courseId }: { courseId: string }) => {
	const { mutate } = trpc.learner.create.useMutation();
	const form = useForm<Input>({
		resolver: zodResolver(InputSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async ({ email }: Input) => {
		mutate({ email, courseId, sendEmail: false });
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
				<Button
					variant="outline"
					className="ml-3"
					onClick={() => mutate({ email: null, courseId })}
				>
					Continue as guest
				</Button>
			</form>
		</Form>
	);
};

export default PublicEmailForm;
