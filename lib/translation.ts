import { CourseTranslation } from "@/types/course";

export const translateCourse = (
	translations: CourseTranslation[],
	locale?: string
) => {
	return (
		translations.find((t) => t.language === locale) ||
		translations.find((t) => t.default) ||
		translations[0]
	);
};
