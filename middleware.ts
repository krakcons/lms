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
	const [, locale, ...segments] = req.nextUrl.pathname.split("/");

	if (
		hostname &&
		hostname !== env.NEXT_PUBLIC_ROOT_DOMAIN &&
		locales.includes(locale)
	) {
		const team = await db.query.teams.findFirst({
			where: eq(teams.customDomain, hostname),
		});
		req.nextUrl.pathname = `/${locale}/play/${team?.id}${segments.join("/")}`;
	}

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
