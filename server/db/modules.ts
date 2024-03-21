import { SelectCourse } from "@/types/course";
import { and, eq } from "drizzle-orm";
import { LCDSError } from "../errors";
import { db } from "./db";
import { modules } from "./schema";

export const modulesData = {
	get: async ({ id }: SelectCourse, userId?: string) => {
		const authed = userId ? eq(modules.userId, userId) : undefined;

		const courseModule = await db.query.modules.findFirst({
			where: and(eq(modules.id, id), authed),
		});

		if (!courseModule) {
			throw new LCDSError({
				code: "NOT_FOUND",
				message: "Module not found",
			});
		}

		return courseModule;
	},
	delete: async ({ id }: SelectCourse, userId: string) => {
		const courseModule = await modulesData.get({ id }, userId);

		await db
			.delete(modules)
			.where(
				and(eq(modules.id, courseModule.id), eq(modules.userId, userId))
			);
	},
};
