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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import {
	Course,
	UpdateCourseSettings,
	UpdateCourseSettingsSchema,
} from "@/types/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const CourseSettingsForm = ({ course }: { course: Course }) => {
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: async (input: UpdateCourseSettings) => {
			const res = await client.api.courses[":id"].$put({
				param: {
					id: course.id,
				},
				json: input,
			});
			if (!res.ok) {
				throw new Error(await res.text());
			}
			return res;
		},
		onSuccess: () => {
			router.refresh();
			toast.success("Successfully Updated");
		},
		onError: (err) => {
			toast.error("Something went wrong!", {
				description: err.message,
			});
		},
	});

	const form = useForm<UpdateCourseSettings>({
		resolver: zodResolver(UpdateCourseSettingsSchema),
		defaultValues: {
			completionStatus: course.completionStatus,
		},
	});

	const onSubmit = async (input: UpdateCourseSettings) => {
		mutate(input);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{form.formState.errors.root?.message && (
					<FormError message={form.formState.errors.root.message} />
				)}
				<FormField
					control={form.control}
					name={"completionStatus"}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Completion Status</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<FormControl>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectGroup>
										{["passed", "completed", "either"].map(
											(status) => (
												<SelectItem
													key={status}
													value={status}
												>
													{status[0].toUpperCase() +
														status.slice(1)}
												</SelectItem>
											)
										)}
									</SelectGroup>
								</SelectContent>
							</Select>
							<FormDescription>
								When the course is considered completed.
								Certificate is issued and course is locked.
							</FormDescription>
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

export default CourseSettingsForm;
