import { learners } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { WithUser } from "./users";

export const LearnerSchema = createSelectSchema(learners);
export type Learner = InferSelectModel<typeof learners>;

export type FullLearner = WithUser<Learner> & {
	data: {
		status: string;
		score?: {
			raw?: number | string;
			max?: number | string;
			min?: number | string;
		};
	};
};

export const LearnerInviteSchema = z.object({
	email: z.string().email(),
});
export type LearnerInvite = z.infer<typeof LearnerInviteSchema>;
