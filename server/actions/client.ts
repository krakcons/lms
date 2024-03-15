import { getAuth } from "@/server/actions/cached";
import { createSafeActionClient } from "next-safe-action";
import { LCDSError } from "../errors";

export const action = createSafeActionClient();

export const authAction = createSafeActionClient({
	handleReturnedServerError: (error) => {
		if (error instanceof LCDSError) {
			return error.message ?? error.code;
		} else {
			return "INTERNAL_SERVER_ERROR";
		}
	},
	middleware: async () => {
		const { user, session } = await getAuth();

		if (!user) {
			throw new LCDSError({
				code: "UNAUTHORIZED",
				message: "Unauthorized",
			});
		}

		return { user, session };
	},
});
