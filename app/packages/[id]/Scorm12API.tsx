"use client";

declare global {
	interface Window {
		API: any;
	}
}

window.API = window.API || {};

const Scorm12API = ({ children }: { children: React.ReactNode }) => {
	window.API = {
		LMSInitialize: (): boolean => {
			console.log("LMSInitialize");
			return true;
		},
		LMSGetValue: (key: string): string => {
			console.log(`LMSGetValue(${key})`);
			return `LMSGetValue(${key})`;
		},
		LMSSetValue: (key: string, value: string): string => {
			console.log(`LMSSetValue(${key}, ${value})`);
			return `LMSSetValue(${key}, ${value})`;
		},
		LMSFinish: (): boolean => {
			console.log("LMSFinish");
			return true;
		},
	};

	return <>{children}</>;
};

export default Scorm12API;
