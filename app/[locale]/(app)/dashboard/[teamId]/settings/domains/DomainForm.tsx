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
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const DomainFormSchema = z.object({
	customDomain: validDomainSchema.optional(),
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
		mutationFn: client.api.teams.$put,
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

	const onSubmit = async (input: DomainForm) => {
		mutate({
			json: { ...team, ...input },
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="customDomain"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Custom Domain</FormLabel>
							<FormControl>
								<div className="flex items-center gap-2">
									<Input
										placeholder="Enter domain in format (example.com)"
										{...field}
									/>
									<Button type="submit" className="gap-2">
										{isPending && (
											<Loader2
												size={20}
												className="animate-spin"
											/>
										)}
										Submit
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};

export default DomainForm;
