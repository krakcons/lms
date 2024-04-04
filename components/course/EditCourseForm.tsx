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
	CourseTranslation,
	CreateCourse,
	CreateCourseSchema,
} from "@/types/course";
import { Language } from "@/types/translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Separator } from "../ui/separator";

export const EditCourseForm = ({
	translations,
	language,
	courseId,
}: {
	translations: CourseTranslation[];
	language: Language;
	courseId: string;
}) => {
	const router = useRouter();
	const defaultCourse = translate(translations, language);
	const form = useForm<CreateCourse>({
		resolver: zodResolver(CreateCourseSchema),
		defaultValues: {
			default: defaultCourse.default,
			language,
			name: defaultCourse.name,
			description: defaultCourse.description,
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
		mutationFn: client.api.courses[":id"].$put,
		onSuccess: () => {
			router.refresh();
			toast("Course updated successfully");
		},
	});

	// 2. Define a submit handler.
	const onSubmit = (values: CreateCourse) => {
		mutate({
			param: { id: courseId },
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
							<h2>Edit Course</h2>
							<p className="text-muted-foreground">
								Edit course in multiple languages
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
		</main>
	);
};
