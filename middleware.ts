import { eq } from "drizzle-orm";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { env } from "./env.mjs";
import { defaultLocale, locales } from "./i18n";
import { db } from "./server/db/db";
import { teams } from "./server/db/schema";

export default async function middleware(req: NextRequest) {
	const url = req.nextUrl;
	let hostname = req.headers.get("host");

	const searchParams = url.searchParams.toString();
	const path = `${url.pathname}${
		searchParams.length > 0 ? `?${searchParams}` : ""
	}`;

	if (hostname && hostname !== env.NEXT_PUBLIC_ROOT_DOMAIN) {
		const team = await db.query.teams.findFirst({
			where: eq(teams.customDomain, hostname),
		});
		req.nextUrl.pathname = `/play/${team?.id}`;
	}

	// Remove https
	// Get the team id from the domain
	// Rewrite to /play/:teamid
	// Should show as revivios.com/courses/:courseId

	const handleI18nRouting = createIntlMiddleware({
		locales,
		defaultLocale,
	});
	const response = handleI18nRouting(req);
	return response;
}

export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
