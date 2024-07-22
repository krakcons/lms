"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getLocaleLabel } from "@/i18n";
import { client } from "@/lib/api";
import { usePathname, useRouter } from "@/lib/navigation";
import { translate } from "@/lib/translation";
import { Course, CourseTranslation } from "@/types/course";
import { BaseLearner, CreateLearnerSchema } from "@/types/learner";
import { Module } from "@/types/module";
import { Language } from "@/types/translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLogger } from "next-axiom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const JoinCourseSchema = CreateLearnerSchema.extend({
	moduleId: z.string(),
});
type JoinCourse = z.infer<typeof JoinCourseSchema>;

export const JoinCourseForm = ({
	course,
	modules,
	text,
	defaultModule,
	initialLearner,
	locale,
}: {
	modules: Module[];
	course: Course & { translations: CourseTranslation[] };
	defaultModule: Module;
	initialLearner?: BaseLearner;
	locale: Language;
	text: {
		title1: string;
		title2: string;
		firstName: string;
		lastName: string;
		email: string;
		join: string;
		continue: string;
		back: string;
		languageLabel: string;
		languageDescription: string;
	};
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const [page, setPage] = useState(0);
	const logger = useLogger();

	const { mutate, isPending } = useMutation({
		mutationFn: async (input: JoinCourse) => {
			const res = await client.api.modules[":id"].learners.$post({
				json: input,
				param: { id: input.moduleId },
			});
			if (!res.ok) {
				const error = await res.text();
				logger.error("Failed to join course", { error });
				throw new Error(error);
			}
			const data = await res.json();
			router.push(
				`${pathname.replace("/join", "")}?learnerId=${data?.id}`
			);
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

	const form = useForm<JoinCourse>({
		resolver: zodResolver(JoinCourseSchema),
		defaultValues: {
			id: initialLearner?.id ?? undefined,
			email: initialLearner?.email ?? "",
			moduleId: defaultModule.id,
			courseId: course.id,
			sendEmail: initialLearner ? false : true,
			firstName: initialLearner?.firstName ?? "",
			lastName: initialLearner?.lastName ?? "",
			inviteLanguage: locale,
		},
	});

	const onSubmit = async (input: JoinCourse) => {
		mutate(input);
	};

	return (
		<div className="flex flex-col gap-4">
			<h1>{page === 0 ? text.title1 : text.title2}</h1>
			<Form {...form}>
				<form className="space-y-4">
					{form.formState.errors.root?.message && (
						<FormError
							message={form.formState.errors.root.message}
						/>
					)}
					{page === 0 && (
						<div className="flex flex-col gap-2 rounded-xl border p-4">
							<p className="text-lg font-medium">
								{translate(course.translations, locale).name}
							</p>
							{translate(course.translations, locale)
								.description && (
								<p className="text-sm text-muted-foreground">
									{
										translate(course.translations, locale)
											.description
									}
								</p>
							)}
							<Label className="mt-4">{text.languageLabel}</Label>
							<FormField
								control={form.control}
								name="moduleId"
								render={({ field }) => (
									<FormItem>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-[150px]">
													<SelectValue placeholder="Select language" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													{modules.map((module) => (
														<SelectItem
															key={module.id}
															value={module.id}
														>
															{getLocaleLabel(
																module.language
															)}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormDescription>
											{text.languageDescription}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					)}
					{page === 1 && (
						<>
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{text.firstName}</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={!!initialLearner}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{text.lastName}</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={!!initialLearner}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{text.email}</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={!!initialLearner}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}
				</form>
			</Form>
			<div className="flex gap-3">
				{page === 1 && (
					<Button
						onClick={() => setPage(0)}
						variant="secondary"
						disabled={isPending}
					>
						{text.back}
					</Button>
				)}
				<Button
					onClick={
						initialLearner
							? form.handleSubmit(onSubmit)
							: page === 1
								? form.handleSubmit(onSubmit)
								: () => setPage(1)
					}
					isPending={form.formState.isSubmitted && isPending}
				>
					{initialLearner
						? text.join
						: page === 1
							? text.join
							: text.continue}
				</Button>
			</div>
		</div>
	);
};
