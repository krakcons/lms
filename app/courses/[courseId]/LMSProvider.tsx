"use client";

import { ScormVersion } from "@/types/scorm/content";
import {
	Scorm12ErrorCode,
	Scorm12ErrorMessage,
} from "@/types/scorm/versions/12";
import { useEffect, useRef, useState } from "react";
import { updateCourseData } from "./actions";

declare global {
	interface Window {
		API: any;
	}
}

type Props = {
	children: React.ReactNode;
	version: ScormVersion;
	courseId: string;
	initialData: any;
};

const useSCORM = ({
	version,
	initialData,
}: {
	version: ScormVersion;
	initialData: Record<string, any>;
}) => {
	const [data, setData] = useState<Record<string, any>>(initialData);
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

	if (version === 1.2) {
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
			LMSGetValue: (key: string): string => {
				console.log("LMSGetValue", key);

				const value = data[key];

				if (!value) {
					error.current = Scorm12ErrorCode.GeneralException;
				}

				return value;
			},
			LMSSetValue: (key: string, value: string): string => {
				console.log("LMSSetValue", key, value);
				if (!key || key === "") {
					return "false";
				}

				const newData = { ...data, [key]: value };

				setData({
					...newData,
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
	} else {
		console.log("Unsupported SCORM version");
	}

	return { data };
};

const LMSProvider = ({ children, version, courseId, initialData }: Props) => {
	const { data } = useSCORM({ version, initialData });

	useEffect(() => {
		updateCourseData(Number(courseId), data);
	}, [data, courseId]);

	return <>{children}</>;
};

export default LMSProvider;
