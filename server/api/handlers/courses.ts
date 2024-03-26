import { coursesData } from "@/server/db/courses";
import { CreateCourseSchema, UpdateCourseSchema } from "@/types/course";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authedMiddleware } from "../middleware";

export const coursesHandler = new Hono()
	.get("/", authedMiddleware, async (c) => {
		const teamId = c.get("teamId");

		const courseList = await coursesData.getAll(undefined, teamId);

		return c.json(courseList);
	})
	.get("/:id", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const teamId = c.get("teamId");

		const course = await coursesData.get({ id }, teamId);

		return c.json(course);
	})
	.post(
		"/",
		authedMiddleware,
		zValidator("json", CreateCourseSchema.omit({ id: true, teamId: true })),
		async (c) => {
			const teamId = c.get("teamId");
			const input = c.req.valid("json");

			const newCourse = await coursesData.create(input, teamId);

			return c.json(newCourse);
		}
	)
	.put(
		"/:id",
		authedMiddleware,
		zValidator("json", UpdateCourseSchema.omit({ id: true })),
		async (c) => {
			const { id } = c.req.param();
			const teamId = c.get("teamId");
			const input = c.req.valid("json");

			const newCourse = await coursesData.update(
				{ id, ...input },
				teamId
			);

			return c.json(newCourse);
		}
	)
	.delete("/:id", authedMiddleware, async (c) => {
		const { id } = c.req.param();
		const teamId = c.get("teamId");

		await coursesData.delete({ id }, teamId);

		return c.json(null);
	});
