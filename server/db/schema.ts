import { relations } from "drizzle-orm";
import {
	json,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { generateId } from "lucia";

export const moduleTypeEnum = pgEnum("module_type", ["1.2", "2004"]);

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

export const collections = pgTable("collections", {
	id: text("id").primaryKey().notNull(),
	userId: text("userId").notNull(),
	name: text("name").notNull(),
	description: text("description").notNull(),
});

export const collectionsRelations = relations(collections, ({ one, many }) => ({
	user: one(users, {
		fields: [collections.userId],
		references: [users.id],
		relationName: "user",
	}),
	collectionsToCourses: many(collectionsToCourses),
}));

export const collectionsToCourses = pgTable(
	"collections_to_courses",
	{
		collectionId: text("collectionId").notNull(),
		courseId: text("courseId").notNull(),
	},
	(t) => ({
		pk: primaryKey({
			columns: [t.collectionId, t.courseId],
		}),
	})
);

export const collectionsToCoursesRelations = relations(
	collectionsToCourses,
	({ one }) => ({
		collection: one(collections, {
			fields: [collectionsToCourses.collectionId],
			references: [collections.id],
		}),
		course: one(courses, {
			fields: [collectionsToCourses.courseId],
			references: [courses.id],
		}),
	})
);

export const courses = pgTable("courses", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$default(() => generateId(15)),
	userId: text("userId").notNull(),
	name: text("name").notNull(),
	description: text("description").notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
	user: one(users, {
		fields: [courses.userId],
		references: [users.id],
		relationName: "user",
	}),
	collectionsToCourses: many(collectionsToCourses),
	modules: many(modules),
}));

export const modules = pgTable(
	"modules",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$default(() => generateId(15)),
		courseId: text("courseId").notNull(),
		userId: text("userId").notNull(),
		language: text("language").notNull(),
		type: moduleTypeEnum("type").notNull(),
	},
	(t) => ({
		unq_module: uniqueIndex("unq_module").on(t.courseId, t.language),
	})
);

export const modulesRelations = relations(modules, ({ many, one }) => ({
	user: one(users, {
		fields: [modules.userId],
		references: [users.id],
	}),
	course: one(courses, {
		fields: [modules.courseId],
		references: [courses.id],
	}),
	learners: many(learners),
}));

export const learners = pgTable("learners", {
	id: text("id").primaryKey().notNull(),
	moduleId: text("moduleId").notNull(),
	email: text("email"),
	data: json("data").$type<Record<string, string>>().notNull().default({}),
});

export const learnersRelations = relations(learners, ({ one }) => ({
	module: one(modules, {
		fields: [learners.moduleId],
		references: [modules.id],
	}),
}));
