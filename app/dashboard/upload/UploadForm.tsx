"use client";
import { trpc } from "@/app/_trpc/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CourseFileSchema, CourseUploadSchema } from "@/lib/course";
import { formatFileSize } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { UploadCourse, UploadCourseSchema } from "@/types/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const Dropzone = ({
	value,
	setValue,
}: {
	value?: File;
	setValue: (value?: File) => void;
}) => {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			console.log(acceptedFiles);
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
				`${value ? "hidden" : ""}`,
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

	const {
		reset,
		control,
		handleSubmit,
		watch,
		setValue,
		register,
		formState: { errors, isValid },
	} = useForm<{
		file: File;
		upload: UploadCourse;
	}>({
		mode: "onChange",
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
			},
		},
	});

	const file = watch("file");
	const version = watch("upload.version");

	const { mutate } = trpc.course.upload.useMutation({
		onMutate: () => {
			toast({
				title: "Uploading...",
				description: "Your file is being uploaded",
			});
		},
		onSuccess: async (data) => {
			const { url, fields } = data;

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
			router.push(`/dashboard`);
			router.refresh();
		},
		onError: (err: any) => {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: err.message,
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
		<form onSubmit={handleSubmit(onSubmit)}>
			<Controller
				name="file"
				control={control}
				rules={{ required: true }}
				render={({ field: { value, onChange } }) => (
					<Dropzone
						value={value}
						setValue={async (file) => {
							const parse =
								await CourseUploadSchema.safeParseAsync(file);
							if (parse.success) {
								setValue("upload", parse.data.upload);
							}
							onChange(file);
						}}
					/>
				)}
			/>
			{file && (
				<Card>
					<CardHeader>
						<CardTitle>Course Details</CardTitle>
						<CardDescription>
							Verify course details and fix errors before upload.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{file && (
							<div className="flex flex-col gap-2">
								{errors.file && (
									<Alert
										variant="destructive"
										className="mb-4"
									>
										<AlertCircle size={18} />
										<AlertTitle>Error</AlertTitle>
										<AlertDescription>
											{errors.file.message}
										</AlertDescription>
									</Alert>
								)}
								<Label>Name</Label>
								<Input
									{...register("upload.name")}
									placeholder="Course Name"
									disabled={!!errors.file?.message}
								/>
								<Label className="mt-3">Size</Label>
								<p className="flex-1 truncate">
									{formatFileSize(file.size)}
								</p>
								<Label className="mt-3">Version</Label>
								<p className="flex-1 truncate">
									{version ? version : "Unknown"}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
			<Button className="mr-4 mt-8" type="submit" disabled={!isValid}>
				Upload
			</Button>
			<Button variant="outline" onClick={() => reset()} disabled={!file}>
				Clear
			</Button>
		</form>
	);
};

export default UploadForm;
