import { redirect as nextRedirect } from "@/lib/navigation";
import { auth } from "@clerk/nextjs";

type Options = {
	redirect?: boolean;
};

// Auth wrapper for getting the current team ID and ensuring the user is logged in
export const getAuth = (options?: Options) => {
	const { userId, orgId, ...rest } = auth();

	const teamId = orgId ?? userId;

	if (!teamId || !userId) {
		if (options?.redirect) {
			nextRedirect("/sign-in");
		} else {
			throw new Error("UNAUTHORIZED");
		}
	}

	return { teamId: teamId!, userId: userId!, orgId, ...rest };
};
