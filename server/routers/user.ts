import { db } from "@/db/db";
import { learners } from "@/db/schema";
import { ExtendLearner } from "@/types/learner";
import { clerkClient } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

const userDTO = z.object({
	id: z.string(),
	email: z.string(),
});

export const userRouter = router({
	me: protectedProcedure
		.meta({
			openapi: {
				summary: "Get user",
				method: "GET",
				path: "/me",
			},
		})
		.input(z.undefined())
		.output(userDTO.extend({ learnings: ExtendLearner.array() }))
		.query(async ({ ctx: { userId } }) => {
			const clerkUser = await clerkClient.users.getUser(userId);

			const user = userDTO.parse({
				id: clerkUser.id,
				email: clerkUser.emailAddresses[0].emailAddress,
			});

			const learnings = await db.query.learners.findMany({
				where: eq(learners.email, user.email),
				with: {
					course: true,
				},
			});

			return {
				...user,
				learnings: ExtendLearner.array().parse(learnings),
			};
		}),
});
