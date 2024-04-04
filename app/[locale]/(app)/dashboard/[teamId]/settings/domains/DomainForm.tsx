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
import { Input } from "@/components/ui/input";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { Team, validDomainSchema } from "@/types/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const DomainFormSchema = z.object({
	customDomain: validDomainSchema,
});
export type DomainForm = z.infer<typeof DomainFormSchema>;

const DomainForm = ({ team }: { team: Team }) => {
	const router = useRouter();
	const form = useForm<DomainForm>({
		resolver: zodResolver(DomainFormSchema),
		defaultValues: {
			customDomain: team.customDomain || "",
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: client.api.teams[":id"].domain.$put,
		onSettled: (res) => {
			if (res && !res.ok) {
				form.setError("customDomain", {
					type: "server",
					message: "Something went wrong",
				});
			} else {
				toast("Successfully updated domain");
			}
			router.refresh();
		},
	});

	const onSubmit = async ({ customDomain }: DomainForm) => {
		mutate({
			param: { id: team.id },
			json: { customDomain },
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="customDomain"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Custom Domain</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter domain in format (example.com)"
									{...field}
								/>
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
	);
};

export default DomainForm;
