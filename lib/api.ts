import { routes } from "@/app/api/[[...route]]/route";
import { env } from "@/env.mjs";
import { hc } from "hono/client";

type AppType = typeof routes;

export const api = hc<AppType>(env.NEXT_PUBLIC_SITE_URL);
