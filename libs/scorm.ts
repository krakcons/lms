import { ScormVersion } from "@/types/scorm/content";

export const getInitialScormData = (version: ScormVersion) => {
	switch (version) {
		case 1.2:
			return {
				"cmi.core.lesson_status": "not attempted",
				"cmi.core.lesson_location": 0,
			};
		default:
			break;
	}
};
