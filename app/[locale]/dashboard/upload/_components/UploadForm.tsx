"use client";
import { trpc } from "@/app/[locale]/_trpc/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormError,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CourseFileSchema, CourseUploadSchema } from "@/lib/course";
import { formatBytes } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { UploadCourse, UploadCourseSchema } from "@/types/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Dropzone = ({
	value,
	setValue,
	hidden,
}: {
	value?: File;
	setValue: (value?: File) => void;
	hidden?: boolean;
}) => {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				setValue(acceptedFiles[0]);
			}
		},
		[setValue]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: { "application/zip": [] },
		onDrop,
		maxFiles: 1,
	});

	return (
		<section
			{...getRootProps()}
			className={cn([
				"flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded border border-primary",
				`${
					isDragActive
						? "border-solid bg-primary-foreground"
						: "border-dashed"
				}`,
			])}
		>
			<input {...getInputProps({ name: "file", type: "file" })} />
			<Upload size={40} className="mb-4" />
			<p className="flex">
				Drag & Drop, or{" "}
				<span className="px-1 text-blue-400 hover:underline">
					click here
				</span>{" "}
				to select files
			</p>
		</section>
	);
};

const UploadForm = () => {
	const { toast } = useToast();
	const router = useRouter();

	const form = useForm<{
		file: File;
		upload: UploadCourse;
	}>({
		resolver: zodResolver(
			z.object({
				file: CourseFileSchema,
				upload: UploadCourseSchema,
			})
		),
		defaultValues: {
			file: undefined,
			upload: {
				name: "",
				version: undefined,
				id: undefined,
			},
		},
	});

	const file = form.watch("file");
	const version = form.watch("upload.version");

	const { mutate, isLoading } = trpc.course.upload.useMutation({
		onMutate: () => {
			toast({
				title: "Uploading...",
				description: "Your file is being uploaded",
			});
		},
		onSuccess: async (data) => {
			const { url, fields } = data.presignedUrl;

			console.log("URL", url, "FIELDS", fields);

			const form: Record<string, any> = {
				...fields,
				"Content-Type": "application/zip",
				file,
			};
			const formData = new FormData();
			Object.keys(form).forEach((key) => {
				formData.append(key, form[key]);
			});
			await fetch(url, {
				method: "POST",
				body: formData,
			});

			toast({
				title: "Upload Successful",
				description: "Your file has been uploaded",
			});
			router.push(`/dashboard/courses/${data.courseId}`);
			router.refresh();
		},
		onError: (err: any) => {
			form.setError("root", {
				type: "server",
				message: err.message,
			});
			toast({
				title: "Something went wrong!",
				description: err.message,
				variant: "destructive",
			});
		},
	});

	const onSubmit = async ({
		upload,
	}: {
		file: File;
		upload: UploadCourse;
	}) => {
		mutate(upload);
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					{!file && (
						<FormField
							name="file"
							control={form.control}
							rules={{ required: true }}
							render={({ field: { value, onChange } }) => (
								<FormItem>
									<FormLabel>Course File</FormLabel>
									<Dropzone
										value={value}
										hidden={!!file}
										setValue={async (file) => {
											const parse =
												await CourseUploadSchema.safeParseAsync(
													file
												);
											if (parse.success) {
												form.clearErrors();
												form.setValue(
													"upload",
													parse.data.upload
												);
												onChange(file);
											} else {
												form.setError("file", {
													message:
														parse.error.errors[0]
															.message,
												});
											}
										}}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
					{file && (
						<Card>
							<CardHeader>
								<CardTitle>Course Details</CardTitle>
								<CardDescription>
									Verify course details and fix errors before
									upload.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{form.formState.errors.root?.message && (
										<FormError
											message={
												form.formState.errors.root
													.message
											}
										/>
									)}
									<FormField
										control={form.control}
										name="upload.id"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Identifier
													<span className="text-muted-foreground">
														{" (Optional)"}
													</span>
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="upload.name"
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
									<div>
										<Label>Size</Label>
										<p className="flex-1 truncate">
											{formatBytes(file.size)}
										</p>
									</div>
									<div>
										<Label>Version</Label>
										<p className="flex-1 truncate">
											{version ? version : "Unknown"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
					<Button
						className="mr-4 mt-8"
						type="submit"
						disabled={!file}
					>
						{isLoading && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Upload
					</Button>
					<Button
						variant="outline"
						onClick={() => form.reset()}
						disabled={!file}
					>
						Clear
					</Button>
				</form>
			</Form>
		</>
	);
};

export default UploadForm;
