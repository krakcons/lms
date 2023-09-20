import { courses } from "@/db/schema";
import { InferModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

export type Course = InferModel<typeof courses, "select">;
export const CourseSchema = createSelectSchema(courses);
