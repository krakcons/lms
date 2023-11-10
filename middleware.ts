import { defaultLocale, locales } from "@/lib/locale";
import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
	locales,
	defaultLocale,
});

export default authMiddleware({
	beforeAuth: (req: NextRequest) => {
		const { pathname } = req.nextUrl;
		if (pathname.startsWith(`/api`) || pathname.startsWith("/content"))
			return;

		return intlMiddleware(req);
	},
	publicRoutes: [
		"/",
		"/:locale",
		"/:locale/sign-in",
		"/:locale/sign-up",
		"/:locale/play/:courseId",
		"/:locale/play/:courseId/public",
		"/:locale/sign-up/sso-callback",
		"/api(.*)",
		"/content(.*)",
	],
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
