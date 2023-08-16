import { int, json, mysqlEnum, mysqlTable, text } from "drizzle-orm/mysql-core";

export const courses = mysqlTable("courses", {
	id: int("id").autoincrement().primaryKey(),
	userId: text("userId").notNull(),
	name: text("name").notNull(),
	version: mysqlEnum("version", [
		"1.2",
		"CAM 1.3",
		"2004 2nd Edition",
		"2004 3rd Edition",
		"2004 4th Edition",
	]).notNull(),
});

export const courseUsers = mysqlTable("courseUsers", {
	id: int("id").autoincrement().primaryKey(),
	courseId: int("courseId").notNull(),
	userId: text("userId").notNull(),
	data: json("data"),
});
