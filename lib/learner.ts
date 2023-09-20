import { Course } from "@/types/course";
import { Learner } from "@/types/learner";
import { User } from "@clerk/nextjs/server";
import { parseLearnerData } from "./scorm";

export const filterUserForClient = ({
	lastName,
	firstName,
	username,
	imageUrl,
	id,
	emailAddresses,
}: User) => {
	return {
		id,
		lastName,
		firstName,
		username,
		imageUrl,
		emailAddress:
			emailAddresses.length > 0 ? emailAddresses[0].emailAddress : null,
	};
};

export const getExpandedLearners = (
	learners: Learner[],
	version: Course["version"]
) => {
	return learners.map(({ data, ...rest }) => {
		const parsedData = parseLearnerData(data, version);
		return {
			...rest,
			...parsedData,
		};
	});
};
export type ExpandedLearner = ReturnType<typeof getExpandedLearners>[0];
