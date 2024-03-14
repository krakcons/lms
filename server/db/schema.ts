import { relations } from "drizzle-orm";
import { json, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const courseVersionEnum = pgEnum("version", ["1.2", "2004"]);

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	email: text("email").unique().notNull(),
	googleId: text("googleId").unique(),
});

export const usersRelations = relations(users, ({ many }) => ({
	courses: many(courses),
	keys: many(keys),
}));

export const keys = pgTable("keys", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull(),
	name: text("name").notNull(),
	key: text("key").notNull(),
});

export const keysRelations = relations(keys, ({ one }) => ({
	user: one(users, {
		fields: [keys.userId],
		references: [users.id],
		relationName: "user",
	}),
}));

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull(),
	expiresAt: timestamp("expiresAt", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
	userId: one(users, {
		fields: [sessions.userId],
		references: [users.id],
		relationName: "userId",
	}),
}));

export const courses = pgTable("courses", {
	id: text("id").primaryKey().notNull(),
	userId: text("userId").notNull(),
	name: text("name").notNull(),
	version: courseVersionEnum("version").notNull(),
});

export const coursesRelations = relations(courses, ({ many, one }) => ({
	user: one(users, {
		fields: [courses.userId],
		references: [users.id],
		relationName: "user",
	}),
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
