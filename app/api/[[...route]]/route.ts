import app from "@/server/api/hono";
import { handle } from "hono/vercel";

// Over 1mb
// export const runtime = "edge";
export const preferredRegion = "cle1";

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
