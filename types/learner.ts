import { learners } from "@/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Module } from "./module";
import { Scorm12DataSchema } from "./scorm/versions/12";
import { Scorm2004DataSchema } from "./scorm/versions/2004";

export const BaseLearnerSchema = createSelectSchema(learners, {
	data: z.record(z.string()),
	email: z.string().email().nullable(),
});
export type BaseLearner = z.infer<typeof BaseLearnerSchema>;

export const LearnerSchema = BaseLearnerSchema.extend({
	status: z.enum(["passed", "failed", "in-progress", "not-started"]),
	score: z
		.object({
			raw: z.number().optional(),
			max: z.number().optional(),
			min: z.number().optional(),
		})
		.optional(),
});
export type Learner = z.infer<typeof LearnerSchema>;

export const ExtendLearner = (type: Module["type"]) => {
	return BaseLearnerSchema.transform((data) => {
		if (type === "1.2") {
			return {
				...data,
				...Scorm12DataSchema.parse(data.data),
			};
		} else {
			return {
				...data,
				...Scorm2004DataSchema.parse(data.data),
			};
		}
	});
};

export const InsertLearnerSchema = createInsertSchema(learners, {
	data: z.record(z.string()),
});
export type InsertLearner = z.infer<typeof InsertLearnerSchema>;

export const DeleteLearnerSchema = LearnerSchema.pick({
	id: true,
	moduleId: true,
}).extend({
	courseId: z.string(),
});
export type DeleteLearner = z.infer<typeof DeleteLearnerSchema>;

export const CreateLearnerSchema = LearnerSchema.pick({
	moduleId: true,
}).extend({
	email: z.string().email().optional(),
	sendEmail: z.boolean().optional(),
	id: z.string().optional(),
});
export type CreateLearner = z.infer<typeof CreateLearnerSchema>;

export type FullLearner = Prettify<
	Learner & {
		status: string;
		score?: {
			raw?: number | string;
			max?: number | string;
			min?: number | string;
		};
	}
>;

export const SelectLearnerSchema = LearnerSchema.pick({
	id: true,
});
export type SelectLearner = z.infer<typeof SelectLearnerSchema>;

export const SelectLearnersSchema = LearnerSchema.pick({
	moduleId: true,
});
export type SelectLearners = z.infer<typeof SelectLearnersSchema>;

export const UpdateLearnerSchema = LearnerSchema.pick({
	id: true,
	moduleId: true,
	data: true,
});
export type UpdateLearner = z.infer<typeof UpdateLearnerSchema>;
