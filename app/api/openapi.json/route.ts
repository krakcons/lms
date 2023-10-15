import { NextResponse } from "next/server";

import { appRouter } from "@/server";

import { env } from "@/env.mjs";
import { generateOpenApiDocument } from "trpc-openapi";

const openApiDocument = generateOpenApiDocument(appRouter, {
	title: "tRPC OpenAPI",
	version: "0.0.2",
	baseUrl: `${env.NEXT_PUBLIC_SITE_URL}/api`,
});

// Respond with our OpenAPI schema
export const GET = () => {
	return NextResponse.json(openApiDocument);
};
