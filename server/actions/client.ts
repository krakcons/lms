import { getAuth } from "@/server/actions/cached";
import { createSafeActionClient } from "next-safe-action";

export const action = createSafeActionClient();

export const authAction = createSafeActionClient({
	middleware: async () => {
		const { user, session } = await getAuth();

		console.log("user", user);
		console.log("session", session);

		if (!user) {
			throw new Error("UNAUTHORIZED");
		}

		return { user, session };
	},
});
