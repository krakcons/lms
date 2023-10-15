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
	version: mysqlEnum("version", ["1.2", "2004"]).notNull(),
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
