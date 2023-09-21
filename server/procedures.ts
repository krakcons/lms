import { getAuth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./trpc";

// Verify the user is logged in
export const protectedProcedure = publicProcedure.use(({ next }) => {
	const { teamId, userId } = getAuth();

	// user not identified
	if (!teamId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not logged in",
		});
	}

	return next({
		ctx: {
			teamId,
			userId,
		},
	});
});
