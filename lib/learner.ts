import { User } from "@clerk/nextjs/server";

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
