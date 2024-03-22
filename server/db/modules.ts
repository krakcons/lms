import { SelectCourse } from "@/types/course";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { db } from "./db";
import { modules } from "./schema";

export const modulesData = {
	get: async ({ id }: SelectCourse, userId?: string) => {
		const authed = userId ? eq(modules.userId, userId) : undefined;

		const courseModule = await db.query.modules.findFirst({
			where: and(eq(modules.id, id), authed),
		});

		if (!courseModule) {
			throw new HTTPException(404, {
				message: "Module not found",
			});
		}

		return courseModule;
	},
	getLearners: async ({ id }: { id: string }, userId: string) => {
		return await db.query.learners.findMany({
			where: and(eq(modules.id, id), eq(modules.userId, userId)),
		});
	},
};
