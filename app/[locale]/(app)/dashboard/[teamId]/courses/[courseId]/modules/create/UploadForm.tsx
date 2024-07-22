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
import { client } from "@/lib/api";
import { formatBytes } from "@/lib/helpers";
import { ModuleFileSchema, ModuleUploadSchema } from "@/lib/module";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { UploadModule, UploadModuleSchema } from "@/types/module";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import JSZip from "jszip";
import { Upload } from "lucide-react";
import mime from "mime-types";
import { useLogger } from "next-axiom";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define a function to check if a file should be ignored
const shouldIgnoreFile = (path: string) => {
	// Adjusted pattern to match files starting with a dot anywhere in the path
	const ignoredPatterns = [/^__MACOSX\//, /\/\./, /^\./];
	return ignoredPatterns.some((pattern) => pattern.test(path));
};

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

const UploadForm = ({
	courseId,
	teamId,
}: {
	courseId: string;
	teamId: string;
}) => {
	const router = useRouter();
	const logger = useLogger();

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
			try {
				const course = await JSZip.loadAsync(file);

				const res = await client.api.modules.$post({
					json: { ...input },
				});
				if (!res.ok) {
					const error = await res.text();
					logger.error("Failed to create module", {
						error,
					});
					console.log("Failed to create module", {
						error,
					});
					throw new Error(error);
				}
				const body = await res.json();
				const moduleId = body.id;

				const results = await Promise.allSettled(
					Object.keys(course.files).map(async (path, index) => {
						let retries = 3; // Number of retries
						while (retries > 0) {
							try {
								if (course.files[path].dir) {
									return;
								}
								// Skip files based on the ignore check
								if (shouldIgnoreFile(path)) {
									console.log(
										`Skipping ignored file: ${path}`
									);
									return; // Skip the rest of the loop and proceed with the next iteration
								}

								const file =
									await course.files[path].async("blob");
								if (!file) {
									throw new Error(
										`Failed to read file ${path}`
									);
								}

								const contentType = mime.lookup(path);
								if (!contentType) {
									throw new Error(
										`Failed to determine content type for ${path}`
									);
								}

								let presignedRes;
								try {
									presignedRes = await client.api.courses[
										":id"
									]["presigned-url"].$post({
										param: { id: courseId },
										json: {
											key: `${input.language}/${path}`,
										},
									});
								} catch (error) {
									logger.error(
										`Failed to get presigned URL for ${path}`,
										{
											error,
										}
									);
									console.log(
										`Failed to get presigned URL for ${path}`,
										{
											error,
										}
									);

									retries--; // Decrement retries on failure
									continue; // Skip to next iteration
								}
								if (!presignedRes.ok) {
									retries--; // Decrement retries on failure
									continue; // Skip to next iteration
								}

								const presignedResBody =
									await presignedRes.json();
								const { url } = presignedResBody;
								if (!url) {
									throw new Error(
										`Failed to get URL from presigned response for ${path}`
									);
								}

								const uploadRes = await fetch(url, {
									method: "PUT",
									headers: new Headers({
										"Content-Type": contentType,
									}),
									body: file,
								});
								if (!uploadRes.ok) {
									const uploadResBody =
										await uploadRes.text();
									throw new Error(
										`Failed to upload file ${path}: ${uploadResBody}`
									);
								}
								break; // Break the loop if successful
							} catch (error) {
								logger.error(`Error processing file ${path}`, {
									error,
								});
								console.log(`Error processing file ${path}`, {
									error,
								});
								retries--; // Decrement retries on failure
								if (retries === 0) {
									throw error; // Throw error after last retry
								}
							}
						}
					})
				);

				const failed = results.some(
					(result) => result.status === "rejected"
				);

				if (failed) {
					logger.error("File failed to upload module", {
						results,
					});
					console.log("File failed to upload module", {
						results,
					});
					await client.api.modules[":id"].$delete({
						param: { id: moduleId },
					});
					throw new Error("Failed to upload module");
				}
			} catch (error) {
				throw error;
			}
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
			router.push(`/dashboard/${teamId}/courses/${courseId}/modules`);
			router.refresh();
		},
		onError: (err: any) => {
			form.setError("root", {
				type: "server",
				message: err.message,
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
						isPending={isPending}
					>
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
