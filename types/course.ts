import { courses } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const CourseSchema = createSelectSchema(courses, {
	name: z.string().min(1, "Course name must be at least 1 character"),
});
export type Course = z.infer<typeof CourseSchema>;

export const DeleteCourseSchema = CourseSchema.pick({
	id: true,
});
export type DeleteCourse = z.infer<typeof DeleteCourseSchema>;

export const SelectCourseSchema = CourseSchema.pick({
	id: true,
});
export type SelectCourse = z.infer<typeof SelectCourseSchema>;

export const UploadCourseSchema = CourseSchema.pick({
	name: true,
	version: true,
}).extend({
	id: z.string().optional(),
});
export type UploadCourse = z.infer<typeof UploadCourseSchema>;

export const UpdateCourseSchema = CourseSchema.pick({
	id: true,
	name: true,
});
