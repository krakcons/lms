import { env } from "@/env";
import { Google } from "arctic";

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${env.NEXT_PUBLIC_SITE_URL}/auth/google/callback`
);
