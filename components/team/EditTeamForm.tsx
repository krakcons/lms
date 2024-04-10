"use client";

import { Button, buttonVariants } from "@/components/ui/button";
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
import { env } from "@/env.mjs";
import { locales } from "@/i18n";
import { client } from "@/lib/api";
import { FileSchema } from "@/lib/module";
import { useRouter } from "@/lib/navigation";
import { translate } from "@/lib/translation";
import { TeamTranslation, UpdateTeamTranslationSchema } from "@/types/team";
import { Language } from "@/types/translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Separator } from "../ui/separator";

const EditTeamFormSchema = UpdateTeamTranslationSchema.extend({
	logo: FileSchema.optional(),
});
type EditTeamForm = z.infer<typeof EditTeamFormSchema>;

export const EditTeamForm = ({
	translations,
	language,
	teamId,
}: {
	translations: TeamTranslation[];
	language: Language;
	teamId: string;
}) => {
	console.log(translations);
	const router = useRouter();
	const defaultTeam = translate(translations, language);
	const [imageUrl, setImageUrl] = useState<string | null>(
		defaultTeam.logo
			? `${env.NEXT_PUBLIC_R2_URL}/${defaultTeam.logo}`
			: null
	);
	const form = useForm<EditTeamForm>({
		resolver: zodResolver(EditTeamFormSchema),
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
		const logo = translate(translations, lang).logo
			? `${env.NEXT_PUBLIC_R2_URL}/${translate(translations, lang).logo}`
			: null;
		setImageUrl(logo);
	}, [lang, form, translations, defaultTeam.logo]);

	const { mutate, isPending } = useMutation({
		mutationFn: async (values: EditTeamForm) => {
			let logoUrl: TeamTranslation["logo"] = null;
			if (values.logo) {
				const presignedRes = await client.api.teams.logo.$post({
					json: {
						language: values.language,
					},
				});
				const { url, imageUrl } = await presignedRes.json();
				const contentType = values.logo.type;

				await fetch(url, {
					method: "PUT",
					headers: contentType
						? new Headers({
								"Content-Type": contentType,
							})
						: undefined,
					body: values.logo,
				});
				logoUrl = imageUrl;
			}

			return client.api.teams[":id"].$put({
				param: { id: teamId },
				json: { ...values, logo: logoUrl },
			});
		},
		onSuccess: () => {
			router.refresh();
			toast("Team updated successfully");
		},
	});

	// 2. Define a submit handler.
	const onSubmit = async (values: EditTeamForm) => {
		mutate(values);
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
					<FormField
						control={form.control}
						name="logo"
						render={({
							field: { value, onChange, ...fieldProps },
						}) => (
							<FormItem className="flex justify-start">
								<FormLabel className="flex items-center gap-4">
									{imageUrl ? (
										<Image
											src={imageUrl}
											width={100}
											height={100}
											alt="Team Logo"
											className="rounded"
										/>
									) : (
										<div className="h-[100px] w-[100px] rounded bg-muted" />
									)}
									<div
										className={buttonVariants({
											variant: "secondary",
											className: "cursor-pointer",
										})}
									>
										Change Logo
									</div>
								</FormLabel>
								<FormControl>
									<Input
										{...fieldProps}
										placeholder="Logo"
										type="file"
										className="hidden"
										accept="image/*"
										onChange={(event) => {
											onChange(
												event.target.files &&
													event.target.files[0]
											);
											if (event.target.files) {
												setImageUrl(
													URL.createObjectURL(
														event.target.files[0]!
													).toString()
												);
											}
										}}
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
		</main>
	);
};
