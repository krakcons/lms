import { env } from "@/env.mjs";
import { generateOpenApiDocument } from "trpc-openapi";
import { courseRouter } from "./routers/course";
import { learnerRouter } from "./routers/learner";
import { router } from "./trpc";

export const appRouter = router({
	learner: learnerRouter,
	course: courseRouter,
});

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: "tRPC OpenAPI",
	version: "0.0.1",
	baseUrl: `${env.NEXT_PUBLIC_SITE_URL}/api`,
});

export type AppRouter = typeof appRouter;
