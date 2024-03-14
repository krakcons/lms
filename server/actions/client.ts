import { getAuth } from "@/server/actions/cached";
import { createSafeActionClient } from "next-safe-action";

export const action = createSafeActionClient();

export const authAction = createSafeActionClient({
	handleReturnedServerError: (error) => {
		if (error.message === "UNAUTHORIZED") {
			return "UNAUTHORIZED";
		} else {
			return "INTERNAL_SERVER_ERROR";
		}
	},
	middleware: async () => {
		const { user, session } = await getAuth();

		if (!user) {
			throw new Error("UNAUTHORIZED");
		}

		return { user, session };
	},
});
