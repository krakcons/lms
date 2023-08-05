"use client";
import { formatFileSize } from "@/libs/helpers";
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineFileUpload } from "react-icons/md";
import { uploadCourse } from "../actions";

type Props = {};

const UploadForm = ({}: Props) => {
	const [courseZip, setCourseZip] = useState<File | null>(null); // [1
	const [isPending, startTransition] = useTransition();

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) {
			setCourseZip(acceptedFiles[0]);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
		accept: { "application/zip": [] },
		onDrop,
		maxFiles: 1,
	});

	return (
		<form
			onSubmit={() => {
				if (!courseZip) return;
				startTransition(() => {
					const formData = new FormData();
					formData.append("file", courseZip);
					uploadCourse(formData);
				});
			}}
		>
			{isPending && <div>Uploading...</div>}
			{courseZip && (
				<div className="p-8 bg-elevation-2 flex justify-between items-center">
					<div className="flex flex-col">
						<p className="font-bold mb-3">Name</p>
						<p>{courseZip.name}</p>
					</div>
					<div className="flex flex-col">
						<p className="font-bold mb-3">Size</p>
						<p>{formatFileSize(courseZip.size)}</p>
					</div>
					<div className="flex flex-col">
						<p className="font-bold mb-3">Last Modified</p>
						<p>{new Date(courseZip.lastModified).toDateString()}</p>
					</div>
					<div className="flex">
						<input type="submit" value="Upload" className="btn mr-4" />
						<button onClick={() => setCourseZip(null)} className="btn">
							Clear
						</button>
					</div>
				</div>
			)}
			<section
				{...getRootProps()}
				className={`border-light-gray cursor-pointer w-full h-64 border rounded flex justify-center items-center flex-col ${
					isDragActive ? "border-solid bg-elevation-2" : "border-dashed"
				} ${acceptedFiles.length > 0 ? "hidden" : ""}`}
			>
				<input {...getInputProps({ name: "file", type: "file" })} />
				<MdOutlineFileUpload size={40} className="mb-4" />
				<p className="flex">
					Drag & Drop, or{" "}
					<span className="text-blue-400 px-1 hover:underline">click here</span> to select
					files
				</p>
			</section>
		</form>
	);
};

export default UploadForm;
