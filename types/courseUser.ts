import { courseUsers } from "@/libs/db/schema";
import { InferModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { WithUser } from "./users";

export type CourseUser = InferModel<typeof courseUsers, "select">;
export const CourseUserSchema = createSelectSchema(courseUsers);

export type FullCourseUser = WithUser<CourseUser> & {
	data: {
		status: string;
		score?: {
			raw?: number | string;
			max?: number | string;
			min?: number | string;
		};
	};
};
