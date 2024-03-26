import createIntlMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { defaultLocale, locales } from "./i18n";

export default async function middleware(req: NextRequest) {
	const url = req.nextUrl;
	let hostname = req.headers.get("host");

	console.log("HOST", hostname);

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
