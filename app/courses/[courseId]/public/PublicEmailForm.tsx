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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const InputSchema = z.object({
	email: z.string().email(),
});
type Input = z.infer<typeof InputSchema>;

const PublicEmailForm = ({ courseId }: { courseId: string }) => {
	const router = useRouter();
	const { mutate } = trpc.learner.create.useMutation({
		onSuccess: ({ id }) => {
			console.log("NEW ID", id);
			router.push(`/courses/${courseId}?learnerId=${id}`);
		},
	});

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
			<form className="space-y-8">
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
				<Button type="submit" onClick={form.handleSubmit(onSubmit)}>
					Submit
				</Button>
				<Button
					variant="outline"
					className="ml-3"
					onClick={(e) => {
						e.preventDefault();
						mutate({ email: null, courseId });
					}}
				>
					Continue as guest
				</Button>
			</form>
		</Form>
	);
};

export default PublicEmailForm;
