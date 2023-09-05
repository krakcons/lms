"use client";

import { joinCourse } from "@/app/dashboard/actions";
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

const PublicUserInviteSchema = z.object({
	email: z.string().email(),
});
type PublicUserInvite = z.infer<typeof PublicUserInviteSchema>;

const PublicEmailForm = ({ courseId }: { courseId: string }) => {
	const form = useForm<PublicUserInvite>({
		resolver: zodResolver(PublicUserInviteSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async ({ email }: PublicUserInvite) => {
		await joinCourse({ email, courseId });
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
					onClick={async () =>
						await joinCourse({ email: "", courseId })
					}
				>
					Continue as guest
				</Button>
			</form>
		</Form>
	);
};

export default PublicEmailForm;
