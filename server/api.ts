import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { LCDSError } from "./errors";

export const withErrorHandling =
	(func: (...args: any[]) => any) =>
	async (...args: any[]) => {
		try {
			return await func(...args);
		} catch (error) {
			if (error instanceof LCDSError) {
				return NextResponse.json(
					error.toObject(),
					error.toStatusObject()
				);
			} else if (error instanceof ZodError) {
				const e = new LCDSError({
					code: "VALIDATION_ERROR",
					message: "Error validating input.",
				});
				return NextResponse.json(
					{
						...e.toObject(),
						errors: error.errors,
					},
					e.toStatusObject()
				);
			} else {
				const e = new LCDSError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An unknown error occurred.",
				});
				return NextResponse.json(e.toObject(), e.toStatusObject());
			}
		}
	};
