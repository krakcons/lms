import { env } from "@/env.mjs";
import { generateOpenApiDocument } from "trpc-openapi";
import { z } from "zod";
import { courseRouter } from "./routers/course";
import { learnerRouter } from "./routers/learner";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
	learner: learnerRouter,
	course: courseRouter,
	greeting: publicProcedure
		.meta({
			openapi: {
				summary: "Get a greeting",
				method: "GET",
				path: "/greeting",
			},
		})
		.input(z.object({ greeting: z.string() }))
		.output(z.string())
		.query(({ input: { greeting } }) => {
			return `Hello ${greeting}!`;
		}),
});

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: "tRPC OpenAPI",
	version: "0.0.1",
	baseUrl: `${env.NEXT_PUBLIC_SITE_URL}/api`,
});

export type AppRouter = typeof appRouter;
