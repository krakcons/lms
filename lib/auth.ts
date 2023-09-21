import { auth } from "@clerk/nextjs";

// Auth wrapper for getting the current team ID and ensuring the user is logged in
export const getAuth = () => {
	const { userId, orgId, ...rest } = auth();

	const teamId = orgId ?? userId;

	return { teamId, userId, orgId, ...rest };
};
