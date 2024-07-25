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
import { CreateTeam, CreateTeamSchema } from "@/types/team";
import { Language } from "@/types/translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const Page = ({
	params: { locale },
}: {
	params: {
		locale: Language;
	};
}) => {
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		mutationFn: async (input: CreateTeam) => {
			const res = await client.api.teams.$post({
				json: input,
			});
			if (!res.ok) {
				throw new Error(await res.text());
			}
			const data = await res.json();
			router.push(`/dashboard/${data.id}`);
		},
		onError: (err) => {
			form.setError("root", {
				type: "server",
				message: err.message,
			});
		},
	});

	const form = useForm<CreateTeam>({
		resolver: zodResolver(CreateTeamSchema),
		defaultValues: {
			name: "",
			language: locale,
		},
	});

	const onSubmit = async (input: CreateTeam) => {
		mutate(input);
	};

	return (
		<div className="m-auto flex h-full max-w-screen-sm flex-1 flex-col justify-center gap-4 p-8">
			<h1>Create a team</h1>
			<p className="text-sm text-muted-foreground">
				Enter the name of your new team. You can customize the team name
				and identity later.
			</p>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input {...field} />
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
		</div>
	);
};

export default Page;
