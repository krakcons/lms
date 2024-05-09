"use client";

import { buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { client } from "@/lib/api";
import { Link, usePathname } from "@/lib/navigation";
import { Learner } from "@/types/learner";
import { Module } from "@/types/module";
import {
	Scorm12ErrorCode,
	Scorm12ErrorMessage,
} from "@/types/scorm/versions/12";
import {
	Scorm2004ErrorCode,
	Scorm2004ErrorMessage,
} from "@/types/scorm/versions/2004";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

declare global {
	interface Window {
		API: any;
		API_1484_11: any;
	}
}

const useSCORM = ({
	type,
	initialData,
}: {
	type: Module["type"];
	initialData: Record<string, any>;
}) => {
	const [data, setData] = useState<Record<string, string>>(initialData);
	const error = useRef<number | undefined>();
	const initialized = useRef<boolean>(false);

	// Log error
	useEffect(() => {
		if (error.current) {
			console.log(
				"Error: ",
				Scorm12ErrorMessage[error.current as Scorm12ErrorCode].short
			);
		}
	}, [error]);

	console.log("useSCORM", type === "1.2" && typeof window !== "undefined");

	if (type === "1.2" && typeof window !== "undefined") {
		window.API = {
			LMSInitialize: (): boolean => {
				console.log("LMSInitialize");

				if (initialized.current) {
					error.current = Scorm12ErrorCode.GeneralException;
					return false;
				}

				initialized.current = true;

				return true;
			},
			LMSCommit: (): boolean => {
				console.log("LMSCommit");

				return true;
			},
			LMSGetValue: (key: string): string => {
				if (!key || key === "") {
					return "";
				}

				const value = data[key] ?? "";

				console.log("LMSGetValue", key, value);

				return `${value}`;
			},
			LMSSetValue: (key: string, value: string): string => {
				console.log("LMSSetValue", key, `${value}`);

				if (!key || key === "") {
					console.log("Error: key is empty", key);
					return "false";
				}

				setData((prev) => {
					return {
						...prev,
						[key]: `${value}`,
					};
				});

				return "true";
			},
			LMSGetLastError: (): number | null => {
				console.log("LMSGetLastError", error ?? null);

				return error.current ?? null;
			},
			LMSGetErrorString: (code: number): string => {
				console.log("LMSGetErrorString", code);
				if (code && Object.values(Scorm12ErrorCode).includes(code)) {
					return Scorm12ErrorMessage[code as Scorm12ErrorCode].short;
				} else {
					return "";
				}
			},
			LMSGetDiagnostic: (code: number): string => {
				console.log("LMSGetDiagnostic", code);
				if (code && Object.values(Scorm12ErrorCode).includes(code)) {
					return Scorm12ErrorMessage[code as Scorm12ErrorCode]
						.diagnostic;
				} else {
					return "";
				}
			},
			LMSFinish: (): boolean => {
				console.log("LMSFinish");

				return true;
			},
		};
	} else if (type === "2004" && typeof window !== "undefined") {
		window.API_1484_11 = {
			Initialize: (): boolean => {
				console.log("Initialize");

				if (initialized.current) {
					error.current = Scorm2004ErrorCode.AlreadyInitialized;
					return false;
				}

				initialized.current = true;

				return true;
			},
			Commit: (): boolean => {
				console.log("Commit");

				return true;
			},
			GetValue: (key: string): string => {
				if (!key || key === "") {
					return "";
				}

				const value = data[key];

				console.log("GetValue", key, value);

				if (value === undefined) {
					error.current = Scorm2004ErrorCode.GeneralGetFailure;
					console.log("Error: couldn't find value for key", key);
				}

				return `${value}`;
			},
			SetValue: (key: string, value: string): string => {
				console.log("SetValue", key, value);
				if (!key || key === "") {
					console.log("Error: key is empty", key);
					return "false";
				}

				setData((prev) => {
					return {
						...prev,
						[key]: `${value}`,
					};
				});

				return "true";
			},
			GetLastError: (): number | null => {
				console.log("GetLastError", error ?? null);

				return error.current ?? null;
			},
			GetErrorString: (code: number): string => {
				console.log("GetErrorString", code);
				if (code && Object.values(Scorm2004ErrorCode).includes(code)) {
					return Scorm2004ErrorMessage[code as Scorm2004ErrorCode]
						.short;
				} else {
					return "";
				}
			},
			GetDiagnostic: (code: number): string => {
				console.log("GetDiagnostic", code);
				if (code && Object.values(Scorm2004ErrorCode).includes(code)) {
					return Scorm2004ErrorMessage[code as Scorm2004ErrorCode]
						.diagnostic;
				} else {
					return "";
				}
			},
			Terminate: (): boolean => {
				console.log("Terminate");

				return true;
			},
		};
	}

	return { data };
};

const LMSProvider = ({
	type,
	learner,
	course,
	url,
	text,
}: {
	type: Module["type"];
	learner: Learner;
	url: string;
	course: string;
	text: {
		download: string;
		title: string;
		description: string;
	};
}) => {
	const [open, setOpen] = useState(false);
	const { mutate } = useMutation({
		mutationFn: client.api.learners[":id"].$put,
		onSuccess: async (res) => {
			const closed = localStorage.getItem(learner.id);
			const data = await res.json();
			if (data.completedAt && !closed) {
				setOpen(true);
			}
		},
	});

	const { data } = useSCORM({
		type,
		initialData: learner.data,
	});

	useEffect(() => {
		if (!learner.completedAt) {
			mutate({ param: { id: learner.id }, json: { ...learner, data } });
		}
	}, [data, learner, mutate]);

	const pathname = usePathname();

	return (
		<>
			<Dialog
				onOpenChange={(open) => {
					if (!open) {
						localStorage.setItem(learner.id, "true");
					}
					setOpen(open);
				}}
				open={open}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{course} {text.title}
						</DialogTitle>
						<DialogDescription>
							{text.description}
						</DialogDescription>
					</DialogHeader>
					<Link
						href={`${pathname}/certificate?learnerId=${learner.id}`}
						className={buttonVariants()}
					>
						{text.download}
					</Link>
				</DialogContent>
			</Dialog>
			<iframe src={url} className="flex-1" />
		</>
	);
};

export default LMSProvider;
