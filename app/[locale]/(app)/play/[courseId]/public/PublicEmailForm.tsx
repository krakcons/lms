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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const InputSchema = z.object({
	email: z.string().email(),
});
type Input = z.infer<typeof InputSchema>;

const PublicEmailForm = ({
	courseId,
	moduleId,
	text,
}: {
	moduleId: string;
	courseId: string;
	text: {
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
			router.push(`/play/${courseId}?learnerId=${data?.id}`);
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

	const form = useForm<Input>({
		resolver: zodResolver(InputSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async ({ email }: Input) => {
		mutate({ param: { id: moduleId }, json: { email } });
	};

	return (
		<Form {...form}>
			<form className="space-y-4">
				{form.formState.errors.root?.message && (
					<FormError message={form.formState.errors.root.message} />
				)}
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
					<Button type="submit" onClick={form.handleSubmit(onSubmit)}>
						{form.formState.isSubmitted && isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{text.submit}
					</Button>
					<Button
						variant="outline"
						onClick={(e) => {
							e.preventDefault();
							console.log(moduleId);
							mutate({
								param: {
									id: moduleId,
								},
								json: { email: undefined },
							});
						}}
					>
						{!form.formState.isSubmitted && isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{text.guest}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default PublicEmailForm;
