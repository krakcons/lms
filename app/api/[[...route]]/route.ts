import app from "@/server/api/hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";

app.use(logger());
app.use(
	cors({
		origin: "*",
		allowHeaders: ["x-api-key"],
		credentials: true,
	})
);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
