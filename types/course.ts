import { courses } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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

export const InsertCourseSchema = createInsertSchema(courses);
export type InsertCourseSchema = typeof courses.$inferInsert;

export const UploadCourseSchema = InsertCourseSchema.pick({
	name: true,
	version: true,
}).extend({
	name: z.string().min(1, "Course name must be at least 1 character"),
});
export type UploadCourse = z.infer<typeof UploadCourseSchema>;
