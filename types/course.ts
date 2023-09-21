import { courses } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const CourseSchema = createSelectSchema(courses);
export type Course = typeof courses.$inferSelect;

export const DeleteCourseSchema = CourseSchema.pick({
	id: true,
});
export type DeleteCourse = z.infer<typeof DeleteCourseSchema>;

export const SelectCourseSchema = CourseSchema.pick({
	id: true,
});
export type SelectCourse = z.infer<typeof SelectCourseSchema>;
