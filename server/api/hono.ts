import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { coursesHandler } from "./handlers/courses";
import { keysHandler } from "./handlers/keys";
import { learnersHandler } from "./handlers/learners";
import { modulesHandler } from "./handlers/modules";
import { teamsHandler } from "./handlers/teams";

const app = new Hono()
	.basePath("/api")
	.use(logger())
	.use(
		cors({
			origin: "*",
			allowHeaders: ["x-api-key", "Content-Type"],
			credentials: true,
		})
	)
	.route("/learners", learnersHandler)
	.route("/modules", modulesHandler)
	.route("/courses", coursesHandler)
	.route("/keys", keysHandler)
	.route("/teams", teamsHandler);

export default app;

export type AppType = typeof app;
