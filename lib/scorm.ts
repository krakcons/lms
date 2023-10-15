import { Course } from "@/types/course";
import { Learner } from "@/types/learner";
import { Scorm12DataSchema } from "@/types/scorm/versions/12";
import { Scorm2004DataSchema } from "@/types/scorm/versions/2004";

export const getInitialScormData = (version: Course["version"]) => {
	console.log(version);
	console.log(typeof version);
	switch (version) {
		case "1.2":
			return {
				"cmi.core.lesson_status": "not attempted",
				"cmi.core.lesson_location": "0",
				"cmi.core.lesson_mode": "browse",
				"cmi.launch_data": "",
				"cmi.suspend_data": "",
			};
		case "2004":
			return {
				"cmi.completion_status": "not attempted",
				"cmi.success_status": "unknown",
				"cmi.location": "0",
				"cmi.mode": "browse",
				"cmi.entry": "ab-initio",
				"cmi.suspend_data": "",
			};
		default:
			break;
	}
};

export const parseLearnerData = (
	learner: Learner,
	version: Course["version"]
) => {
	switch (version) {
		case "1.2": {
			return {
				...learner,
				...Scorm12DataSchema.parse(learner.data),
			};
		}
		case "2004": {
			return {
				...learner,
				...Scorm2004DataSchema.parse(learner.data),
			};
		}
		default: {
			return {
				...learner,
				status: "not attempted",
				score: {
					raw: 100,
					max: 0,
					min: 0,
				},
			};
		}
	}
};
