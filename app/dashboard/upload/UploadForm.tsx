"use client";
import { formatFileSize } from "@/libs/helpers";
import { Field, Form } from "houseform";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { MdOutlineFileUpload } from "react-icons/md";
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
				<div className="flex items-center justify-between overflow-x-auto bg-elevation-2 p-4 sm:p-8">
					<div className="mr-4 flex flex-col">
						<p className="mb-3 text-sm font-bold sm:text-base">
							Name
						</p>
						<p className="text-sm sm:text-base">{value.name}</p>
					</div>
					<div className="mr-4 flex flex-col">
						<p className="mb-3 whitespace-nowrap text-sm font-bold sm:text-base">
							Size
						</p>
						<p className="whitespace-nowrap text-sm sm:text-base">
							{formatFileSize(value.size)}
						</p>
					</div>
					<div className="flex flex-col">
						<p className="mb-3 whitespace-nowrap text-sm font-bold sm:text-base">
							Last Modified
						</p>
						<p className="whitespace-nowrap text-sm sm:text-base">
							{new Date(value.lastModified).toDateString()}
						</p>
					</div>
				</div>
			) : (
				<section
					{...getRootProps()}
					className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded border border-light-gray ${
						isDragActive
							? "border-solid bg-elevation-2"
							: "border-dashed"
					} ${value ? "hidden" : ""}`}
				>
					<input {...getInputProps({ name: "file", type: "file" })} />
					<MdOutlineFileUpload size={40} className="mb-4" />
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
	const router = useRouter();
	const action = async (data: { file: File }) => {
		const formData = new FormData();
		formData.append("file", data.file);
		toast.promise(
			uploadCourse(formData),
			{
				loading: "Uploading",
				success: () => {
					router.push("/dashboard");
					return `Uploaded course`;
				},
				error: (err) => `${err.toString()}`,
			},
			{
				className: "bg-elevation-2 text-white",
				success: {
					duration: 5000,
				},
			}
		);
	};

	return (
		<Form onSubmit={action}>
			{({ submit, isValid, reset }) => (
				<div className="flex-1">
					<Field<File | undefined>
						name="file"
						onMountValidate={z.instanceof(File)}
						onChangeValidate={z.instanceof(File)}
						initialValue={undefined}
					>
						{({ value, setValue }) => (
							<Dropzone value={value} setValue={setValue} />
						)}
					</Field>
					{isValid && (
						<>
							<button onClick={submit} className="btn mr-4 mt-8">
								Upload
							</button>
							<button onClick={reset} className="btn">
								Clear
							</button>
						</>
					)}
				</div>
			)}
		</Form>
	);
};

export default UploadForm;
