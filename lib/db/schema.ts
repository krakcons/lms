import { sql } from "drizzle-orm";
import {
	json,
	mysqlEnum,
	mysqlTable,
	text,
	varchar,
} from "drizzle-orm/mysql-core";

export const courses = mysqlTable("courses", {
	id: varchar("id", { length: 255 })
		.primaryKey()
		.notNull()
		.default(sql`(uuid())`),
	userId: varchar("userId", { length: 255 }).primaryKey().notNull(),
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
	id: varchar("id", { length: 255 })
		.primaryKey()
		.notNull()
		.default(sql`(uuid())`),
	courseId: varchar("courseId", { length: 255 }).primaryKey().notNull(),
	email: text("email").notNull().unique(),
	data: json("data"),
});
