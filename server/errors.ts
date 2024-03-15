// Define your error codes
export type ErrorCode =
	| "BAD_REQUEST"
	| "VALIDATION_ERROR"
	| "UNAUTHORIZED"
	| "NOT_FOUND"
	| "INTERNAL_SERVER_ERROR";

// Define a mapping from error names to HTTP codes
export const HttpCodes: { [key in ErrorCode]: number } = {
	BAD_REQUEST: 400,
	VALIDATION_ERROR: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
	INTERNAL_SERVER_ERROR: 500,
} as const;

export class LCDSError extends Error {
	code: ErrorCode;
	httpCode: number;

	constructor({ code, message }: { code: ErrorCode; message?: string }) {
		super(message);
		this.code = code;
		this.httpCode = HttpCodes[code];
	}

	toObject() {
		return {
			code: this.code,
			message: this.message,
		};
	}

	toStatusObject() {
		return {
			status: this.httpCode,
			statusText: this.code,
		};
	}
}
