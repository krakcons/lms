import { Hono } from "hono";
import { logger } from "hono/logger";
import { coursesHandler } from "./handlers/courses";
import { learnersHandler } from "./handlers/learners";
import { modulesHandler } from "./handlers/modules";

export const app = new Hono()
	.basePath("/api")
	.route("/learners", learnersHandler)
	.route("/modules", modulesHandler)
	.route("/courses", coursesHandler);

app.use(logger());

export type AppType = typeof app;
