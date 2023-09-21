import { relations, sql } from "drizzle-orm";
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
	teamId: varchar("teamId", { length: 255 }).notNull(),
	name: text("name").notNull(),
	version: mysqlEnum("version", [
		"1.2",
		"CAM 1.3",
		"2004 2nd Edition",
		"2004 3rd Edition",
		"2004 4th Edition",
	]).notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
	learners: many(learners),
}));

export const learners = mysqlTable("learners", {
	id: varchar("id", { length: 255 })
		.primaryKey()
		.notNull()
		.default(sql`(uuid())`),
	courseId: varchar("courseId", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }),
	data: json("data").$type<Record<string, string>>().notNull().default({}),
});

export const learnersRelations = relations(learners, ({ one }) => ({
	course: one(courses, {
		fields: [learners.courseId],
		references: [courses.id],
	}),
}));
