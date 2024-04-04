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
	CollectionTranslation,
	CreateCollectionTranslation,
	CreateCollectionTranslationSchema,
} from "@/types/collections";
import { Language } from "@/types/translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";

export const EditCollectionForm = ({
	translations,
	language,
	collectionId,
}: {
	translations: CollectionTranslation[];
	language: Language;
	collectionId: string;
}) => {
	const router = useRouter();
	const defaultCollection = translate(translations, language);
	const form = useForm<CreateCollectionTranslation>({
		resolver: zodResolver(CreateCollectionTranslationSchema),
		defaultValues: {
			default: defaultCollection.default,
			language,
			name: defaultCollection.name,
			description: defaultCollection.description,
		},
	});

	const lang = form.watch("language");

	useEffect(() => {
		form.setValue(
			"name",
			translations.find((translation) => translation.language === lang)
				?.name || ""
		);
		form.setValue(
			"description",
			translations.find((translation) => translation.language === lang)
				?.description || ""
		);
	}, [lang, form, translations]);

	const { mutate, isPending } = useMutation({
		mutationFn: client.api.collections[":id"].$put,
		onSuccess: () => {
			router.refresh();
			toast("Collection updated successfully");
		},
	});

	// 2. Define a submit handler.
	const onSubmit = (values: CreateCollectionTranslation) => {
		mutate({
			param: { id: collectionId },
			json: values,
		});
	};

	return (
		<main>
			<Dialog>
				<DialogTrigger asChild>
					<Button size="icon">
						<Edit size={18} />
					</Button>
				</DialogTrigger>
				<DialogContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-8"
						>
							<div className="mt-4 flex items-center justify-between">
								<DialogHeader>
									<DialogTitle>Edit Collection</DialogTitle>
									<DialogDescription>
										Change the collection translations
									</DialogDescription>
								</DialogHeader>
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
														{locales.map(
															(locale) => (
																<SelectItem
																	key={locale}
																	value={
																		locale
																	}
																>
																	{locale}
																</SelectItem>
															)
														)}
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
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
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
				</DialogContent>
			</Dialog>
		</main>
	);
};
