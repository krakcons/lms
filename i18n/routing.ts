import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from ".";

export const routing = defineRouting({
	locales,
	defaultLocale,
});
