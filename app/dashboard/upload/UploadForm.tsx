"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineFileUpload } from "react-icons/md";

type Props = {};

const UploadForm = ({}: Props) => {
	const onDrop = useCallback((acceptedFiles: File[]) => {
		console.log(acceptedFiles);
		// Validate the file is scorm compliant (has imsmanifest.xml)
		// Return the metadata
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "application/zip": [] },
		maxFiles: 1,
	});

	return (
		<section
			{...getRootProps()}
			className={`border-light-gray cursor-pointer w-full h-64 border rounded border-dashed flex justify-center items-center flex-col ${
				isDragActive ? "border-solid bg-elevation-2 border-light-gray" : ""
			}`}
		>
			<input {...getInputProps()} />
			<MdOutlineFileUpload size={40} className="mb-4" />
			<p className="flex">
				Drag & Drop, or{" "}
				<span className="text-blue-400 px-1 hover:underline">click here</span> to select
				files
			</p>
		</section>
	);
};

export default UploadForm;
