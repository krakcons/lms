import { learners } from "@/db/schema";
import { parseLearnerData } from "@/lib/scorm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { WithUser } from "./users";

export const LearnerSchema = createSelectSchema(learners, {
	data: z.record(z.string()),
});
export type Learner = z.infer<typeof LearnerSchema>;

export const InsertLearnerSchema = createInsertSchema(learners, {
	data: z.record(z.string()),
});
export type InsertLearner = z.infer<typeof InsertLearnerSchema>;

export const UpdateLearnerSchema = LearnerSchema.pick({
	id: true,
	courseId: true,
}).extend({
	data: z.record(z.string()),
});
export type UpdateLearner = z.infer<typeof UpdateLearnerSchema>;

export const DeleteLearnerSchema = LearnerSchema.shape.id;
export type DeleteLearner = z.infer<typeof DeleteLearnerSchema>;

export const CreateLearnerSchema = LearnerSchema.pick({
	courseId: true,
}).extend({
	email: z.string().email().nullable(),
	sendEmail: z.boolean().optional(),
});
export type CreateLearner = z.infer<typeof CreateLearnerSchema>;

export type FullLearner = Prettify<
	WithUser<Learner> & {
		status: string;
		score?: {
			raw?: number | string;
			max?: number | string;
			min?: number | string;
		};
	}
>;

export type ExpandedLearner = ReturnType<typeof parseLearnerData>;
