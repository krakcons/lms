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
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatBytes } from "@/lib/helpers";
import { ModuleFileSchema, ModuleUploadSchema } from "@/lib/module";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
	deleteModuleAction,
	uploadModuleAction,
} from "@/server/actions/module";
import { getPresignedUrl } from "@/server/actions/s3";
import { UploadModule, UploadModuleSchema } from "@/types/module";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import JSZip from "jszip";
import { Loader2, Upload } from "lucide-react";
import mime from "mime-types";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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

const UploadForm = ({ courseId }: { courseId: string }) => {
	const router = useRouter();

	const form = useForm<{
		file: File;
		upload: UploadModule;
	}>({
		resolver: zodResolver(
			z.object({
				file: ModuleFileSchema,
				upload: UploadModuleSchema,
			})
		),
		defaultValues: {
			file: undefined,
			upload: {
				type: undefined,
				id: undefined,
				language: "en",
				courseId: courseId,
			},
		},
	});

	const file = form.watch("file");
	const moduleType = form.watch("upload.type");

	const { mutate, isPending } = useMutation({
		mutationFn: async (input: UploadModule) => {
			const course = await JSZip.loadAsync(file);

			const moduleId = input.id ?? crypto.randomUUID();

			const results = await Promise.allSettled(
				Object.keys(course.files).map(async (path, index) => {
					const file = await course.files[path].async("blob");
					const contentType = mime.lookup(path);
					const url = await getPresignedUrl(
						`courses/${courseId}/${moduleId}/${path}`
					);

					await fetch(url, {
						method: "PUT",
						headers: contentType
							? new Headers({
									"Content-Type": contentType,
								})
							: undefined,
						body: file,
					});
				})
			);

			const failed = results.some(
				(result) => result.status === "rejected"
			);

			if (failed) {
				await deleteModuleAction({
					id: moduleId,
				});
				throw new Error("Failed to upload module");
			}

			const { data, serverError } = await uploadModuleAction({
				...input,
				id: moduleId,
			});

			if (serverError) {
				throw new Error(serverError);
			}

			return data;
		},
		onMutate: () => {
			toast("Uploading...", {
				description: "Your file is being uploaded",
			});
		},
		onSuccess: async (_, { courseId }) => {
			toast("Upload Successful", {
				description: "Your file has been uploaded",
			});
			router.push(`/dashboard/courses/${courseId}/modules`);
		},
		onError: (err: any) => {
			form.setError("root", {
				type: "server",
				message: err.message,
			});
			toast.error("Something went wrong!", {
				description: err.message,
			});
		},
	});

	const onSubmit = async ({
		upload,
	}: {
		file: File;
		upload: UploadModule;
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
									<FormLabel>Module File</FormLabel>
									<Dropzone
										value={value}
										hidden={!!file}
										setValue={async (file) => {
											const parse =
												await ModuleUploadSchema.safeParseAsync(
													file
												);
											if (parse.success) {
												form.clearErrors();
												form.setValue("upload", {
													...parse.data.upload,
													courseId,
													language: "en",
												});
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
						<div className="space-y-4">
							{form.formState.errors.root?.message && (
								<FormError
									message={form.formState.errors.root.message}
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
								name="upload.language"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Language</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a language" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="en">
													English
												</SelectItem>
												<SelectItem value="fr">
													Francais
												</SelectItem>
											</SelectContent>
										</Select>
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
								<Label>Type</Label>
								<p className="flex-1 truncate">
									{moduleType ? moduleType : "Unknown"}
								</p>
							</div>
						</div>
					)}
					<Button
						className="mr-4 mt-8"
						type="submit"
						disabled={!file}
					>
						{isPending && (
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
