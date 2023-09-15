import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Auth wrapper for getting the current team ID and ensuring the user is logged in
export const getAuth = () => {
	const { userId, orgId, ...rest } = auth();

	const teamId = orgId ?? userId;

	if (!teamId) {
		redirect("/sign-in");
	}

	return { teamId, userId, orgId, ...rest };
};
