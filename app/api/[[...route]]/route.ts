import { coursesHandler } from "@/server/api/handlers/courses";
import { learnersHandler } from "@/server/api/handlers/learners";
import { modulesHandler } from "@/server/api/handlers/modules";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.use(logger());

export const routes = app
	.route("/learners", learnersHandler)
	.route("/modules", modulesHandler)
	.route("/courses", coursesHandler);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
