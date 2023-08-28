"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatFileSize } from "@/lib/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { uploadCourse } from "../actions";

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

	const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
		useDropzone({
			accept: { "application/zip": [] },
			onDrop,
			maxFiles: 1,
		});

	return (
		<>
			{value ? (
				<div className="flex items-center justify-between overflow-x-auto bg-secondary p-4 sm:p-8">
					<div className="mr-4 flex flex-col">
						<p className="font-bold">Name</p>
						<p className="whitespace-nowrap">{value.name}</p>
					</div>
					<div className="mr-4 flex flex-col">
						<p className="font-bold">Size</p>
						<p className="whitespace-nowrap">
							{formatFileSize(value.size)}
						</p>
					</div>
					<div className="flex flex-col">
						<p className="whitespace-nowrap font-bold">
							Last Modified
						</p>
						<p className="whitespace-nowrap">
							{new Date(value.lastModified).toDateString()}
						</p>
					</div>
				</div>
			) : (
				<section
					{...getRootProps()}
					className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded border border-primary ${
						isDragActive
							? "border-solid bg-primary-foreground"
							: "border-dashed"
					} ${value ? "hidden" : ""}`}
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
			)}
		</>
	);
};

const UploadForm = () => {
	const { toast } = useToast();
	const {
		reset,
		control,
		handleSubmit,
		formState: { isValid },
	} = useForm<{ file: File }>({
		resolver: zodResolver(
			z.object({
				file: z.instanceof(File),
			})
		),
		defaultValues: {
			file: undefined,
		},
	});

	const action = (data: { file: File }) => {
		const formData = new FormData();
		formData.append("file", data.file);
		toast({
			title: "Uploading...",
			description: "Your file is being uploaded",
		});
		uploadCourse(formData).then(() => {
			toast({
				title: "Upload Successful",
				description: "Your file has been uploaded",
			});
		});
	};

	return (
		<form onSubmit={handleSubmit(action)}>
			<div className="flex-1">
				<Controller
					name="file"
					control={control}
					rules={{ required: true }}
					render={({ field: { value, onChange } }) => (
						<Dropzone value={value} setValue={onChange} />
					)}
				/>
				{isValid && (
					<>
						<Button type="submit" className="mr-4 mt-8">
							Upload
						</Button>
						<Button onClick={() => reset()}>Clear</Button>
					</>
				)}
			</div>
		</form>
	);
};

export default UploadForm;
