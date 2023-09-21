import { Course } from "@/types/course";
import { Learner } from "@/types/learner";
import { Scorm12DataSchema } from "@/types/scorm/versions/12";

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
			const parsedData = Scorm12DataSchema.parse(learner.data);

			return {
				...learner,
				status: parsedData["cmi.core.lesson_status"],
				score: {
					raw: parsedData["cmi.core.score.raw"],
					max: parsedData["cmi.core.score.max"],
					min: parsedData["cmi.core.score.min"],
				},
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
