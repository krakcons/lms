"use server";

import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db/db";
import { keys } from "../db/schema";
import { authAction } from "./client";

export const createKey = authAction(
	z.object({ name: z.string() }),
	async ({ name }, { user }) => {
		await db.insert(keys).values({
			id: generateId(15),
			name,
			userId: user.id,
			key: generateId(32),
		});
		revalidatePath("/dashboard/settings/api-keys");
	}
);

export const deleteKey = authAction(
	z.object({ id: z.string() }),
	async ({ id }, { user }) => {
		await db
			.delete(keys)
			.where(and(eq(keys.id, id), eq(keys.userId, user.id)));
		revalidatePath("/dashboard/settings/api-keys");
	}
);
