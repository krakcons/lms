import { authMiddleware } from "@clerk/nextjs";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "fr"];
const defaultLocale = "en";

const getLocale = (req: NextRequest) => {
	let headers: Record<string, string> = {};
	req.headers.forEach((value, key) => (headers[key] = value));
	const languages = new Negotiator({ headers }).languages();
	return matchLocale(languages, locales, defaultLocale);
};

const localeMiddleware = (req: NextRequest) => {
	const { pathname } = req.nextUrl;
	const pathnameHasLocale = locales.some(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	);

	if (pathnameHasLocale) return;

	const locale = getLocale(req);
	console.log("locale", locale);
	req.nextUrl.pathname = `/${locale}${pathname}`;
	return NextResponse.redirect(req.nextUrl);
};

export default authMiddleware({
	beforeAuth: (req) => {
		return localeMiddleware(req);
	},
	publicRoutes: [
		"/",
		"/courses/:courseId",
		"/courses/:courseId/public",
		"/api(.*)",
	],
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
