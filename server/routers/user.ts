import { db } from "@/db/db";
import { learners } from "@/db/schema";
import { ExtendLearner } from "@/types/learner";
import { clerkClient } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

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
		.query(async ({ ctx: { userId } }) => {
			const user = await clerkClient.users.getUser(userId);

			const userDTO = z
				.object({
					id: z.string(),
					email: z.string(),
				})
				.parse({
					id: user.id,
					email: user.emailAddresses[0].emailAddress,
				});

			const learnings = await db.query.learners.findMany({
				where: eq(learners.email, userDTO.email),
				with: {
					course: true,
				},
			});

			return {
				...userDTO,
				learnings: ExtendLearner.array().parse(learnings),
			};
		}),
});
