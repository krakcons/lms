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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { locales } from "@/i18n";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { translate } from "@/lib/translation";
import {
	TeamTranslation,
	UpdateTeamTranslation,
	UpdateTeamTranslationSchema,
} from "@/types/team";
import { Language } from "@/types/translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Separator } from "../ui/separator";

export const EditTeamForm = ({
	translations,
	language,
	teamId,
}: {
	translations: TeamTranslation[];
	language: Language;
	teamId: string;
}) => {
	const router = useRouter();
	const defaultTeam = translate(translations, language);
	const form = useForm<UpdateTeamTranslation>({
		resolver: zodResolver(UpdateTeamTranslationSchema),
		defaultValues: {
			default: defaultTeam.default,
			language,
			name: defaultTeam.name,
		},
	});

	const lang = form.watch("language");

	useEffect(() => {
		form.setValue(
			"name",
			translations.find((translation) => translation.language === lang)
				?.name || ""
		);
	}, [lang, form, translations]);

	const { mutate, isPending } = useMutation({
		mutationFn: client.api.teams[":id"].$put,
		onSuccess: () => {
			router.refresh();
			// toast("Team updated successfully");
		},
	});

	// 2. Define a submit handler.
	const onSubmit = (values: UpdateTeamTranslation) => {
		mutate({
			param: { id: teamId },
			json: values,
		});
	};

	return (
		<main>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
				>
					<div className="flex items-center justify-between">
						<div>
							<h2>Edit Team</h2>
							<p className="text-muted-foreground">
								Edit team in multiple languages
							</p>
						</div>
						<FormField
							control={form.control}
							name="language"
							render={({ field }) => (
								<FormItem>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-[80px]">
												<SelectValue placeholder="Select language" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectGroup>
												{locales.map((locale) => (
													<SelectItem
														key={locale}
														value={locale}
													>
														{locale}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Separator className="my-8" />
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
		</main>
	);
};
