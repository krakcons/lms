import { InferModel } from "drizzle-orm";
import { int, json, mysqlTable, text } from "drizzle-orm/mysql-core";

export const courses = mysqlTable("courses", {
	id: int("id").autoincrement().primaryKey(),
	userId: text("userId").notNull(),
	name: text("name").notNull(),
});
export type Course = InferModel<typeof courses, "select">;

export const courseUsers = mysqlTable("courseUsers", {
	id: int("id").autoincrement().primaryKey(),
	courseId: int("courseId").notNull(),
	userId: text("userId").notNull(),
	data: json("data"),
});
