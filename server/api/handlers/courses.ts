import { coursesData } from "@/server/db/courses";
import { UpdateCourseSchema } from "@/types/course";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authedMiddleware } from "../middleware";

export const coursesHandler = new Hono()
	.get("/", authedMiddleware, async (c) => {
		const user = c.get("user");

		const courseList = await coursesData.getAll(undefined, user.id);

		return c.json(courseList);
	})
	.get("/:id", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const user = c.get("user");

		const course = await coursesData.get({ id }, user.id);

		return c.json(course);
	})
	.put(
		"/:id",
		authedMiddleware,
		zValidator("json", UpdateCourseSchema.omit({ id: true })),
		async (c) => {
			const { id } = c.req.param();
			const user = c.get("user");
			const input = c.req.valid("json");

			const newCourse = await coursesData.update(
				{ id, ...input },
				user.id
			);

			return c.json(newCourse);
		}
	)
	.delete("/:id", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const user = c.get("user");

		await coursesData.delete({ id }, user.id);

		return c.json(null);
	});
