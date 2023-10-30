import { env } from "@/env.mjs";
import { Svix } from "svix";

export const svix = new Svix(env.SVIX_AUTH_TOKEN);
