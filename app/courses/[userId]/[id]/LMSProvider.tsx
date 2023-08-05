"use client";

import { addToObject, findNestedValue } from "@/libs/helpers";
import { ScormVersion } from "@/types/scorm/content";
import { Scorm12ErrorCode, Scorm12ErrorMessage } from "@/types/scorm/versions/12";
import { useEffect, useRef, useState } from "react";

declare global {
	interface Window {
		API: any;
	}
}

type Props = {
	children: React.ReactNode;
	version: ScormVersion;
};

const useSCORM = ({ version }: { version: ScormVersion }) => {
	const [data, setData] = useState<any>({
		cmi: {
			core: {
				lesson_status: "not attempted",
				lesson_location: "0",
			},
		},
	});
	const error = useRef<number | undefined>();
	const initialized = useRef<boolean>(false);

	// Log error
	useEffect(() => {
		if (error.current) {
			console.log("Error: ", Scorm12ErrorMessage[error.current as Scorm12ErrorCode].short);
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

				const value = findNestedValue(key, data);

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

				const newData = addToObject(data, key, value);

				// TODO: Store data

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
					return Scorm12ErrorMessage[code as Scorm12ErrorCode].diagnostic;
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

const LMSProvider = ({ children, version }: Props) => {
	const { data } = useSCORM({ version });

	console.log(data);

	return <>{children}</>;
};

export default LMSProvider;
