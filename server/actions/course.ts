"use server";

import { redirect } from "@/lib/navigation";
import { CreateCourseSchema, DeleteCourseSchema } from "@/types/course";
import { coursesData } from "../db/courses";
import { authAction } from "./client";

export const createCourseAction = authAction(
	CreateCourseSchema,
	async ({ name, description }, { user }) => {
		const course = await coursesData.create({ name, description }, user.id);
		redirect(`/dashboard/courses/${course.id}`);
	}
);

export const deleteCourseAction = authAction(
	DeleteCourseSchema,
	async ({ id }, { user }) => {
		await coursesData.delete({ id }, user.id);
		redirect("/dashboard/courses");
	}
);
