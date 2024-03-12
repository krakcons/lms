import { relations } from "drizzle-orm";
import { json, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const courseVersionEnum = pgEnum("version", ["1.2", "2004"]);

export const courses = pgTable("courses", {
	id: text("id").primaryKey().notNull(),
	teamId: text("teamId").notNull(),
	name: text("name").notNull(),
	version: courseVersionEnum("version").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
	learners: many(learners),
}));

export const learners = pgTable("learners", {
	id: text("id").primaryKey().notNull(),
	courseId: text("courseId").notNull(),
	email: text("email"),
	data: json("data").$type<Record<string, string>>().notNull().default({}),
	version: courseVersionEnum("version").notNull(),
});

export const learnersRelations = relations(learners, ({ one }) => ({
	course: one(courses, {
		fields: [learners.courseId],
		references: [courses.id],
	}),
}));
