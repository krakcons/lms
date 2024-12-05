export const locales = ["en", "fr"];
export const defaultLocale = "en";

export const getLocaleLabel = (locale: string) => {
	switch (locale) {
		case "en":
			return "English";
		case "fr":
			return "Français";
		default:
			return locale;
	}
};
