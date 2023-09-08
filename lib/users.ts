import { Course } from "@/types/course";
import { CourseUser } from "@/types/courseUser";
import { User } from "@clerk/nextjs/server";
import { parseCourseUserData } from "./scorm";

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

export const getExpandedUsers = (
	users: CourseUser[],
	version: Course["version"]
) => {
	return users.map(({ data, ...rest }) => {
		const parsedData = parseCourseUserData(data, version);
		return {
			...rest,
			...parsedData,
		};
	});
};
export type CourseUserWithExpandedData = ReturnType<typeof getExpandedUsers>[0];
