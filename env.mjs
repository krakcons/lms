import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		RESEND_API_KEY: z.string().min(1),
		CRON_SECRET: z.string().min(1),
		SVIX_AUTH_TOKEN: z.string().min(1),
		R2_ENDPOINT: z.string().min(1),
		R2_SECRET: z.string().min(1),
		R2_KEY_ID: z.string().min(1),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_SITE_URL: z.string().url(),
		NEXT_PUBLIC_R2_URL: z.string().min(1),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_R2_URL: process.env.NEXT_PUBLIC_R2_URL,
	},
});
