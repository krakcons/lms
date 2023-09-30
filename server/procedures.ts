import { getAuth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./trpc";

// Verify the user is logged in
export const protectedProcedure = publicProcedure.use(({ next, ctx }) => {
	try {
		const { teamId, userId } = getAuth();

		return next({
			ctx: {
				...ctx,
				teamId,
				userId,
			},
		});
	} catch (e) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
		});
	}
});
