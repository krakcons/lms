"use server";

import { db } from "@/server/db/db";
import { modules } from "@/server/db/schema";
import { UploadModuleSchema } from "@/types/module";
import { and, eq } from "drizzle-orm";
import { authAction } from "./client";

export const uploadModuleAction = authAction(
	UploadModuleSchema,
	async ({ type, id, courseId, language }, { user }) => {
		if (id === "") {
			id = undefined;
		}

		if (id) {
			const courseModule = await db.query.modules.findFirst({
				where: and(eq(modules.id, id)),
			});
			if (courseModule) {
				throw new Error("Module already exists with that identifier");
			}
		}

		const insertId = id ?? crypto.randomUUID();

		// Create a new course and svix app
		await db.insert(modules).values({
			id: insertId,
			courseId,
			userId: user.id,
			type,
			language,
		});
	}
);
