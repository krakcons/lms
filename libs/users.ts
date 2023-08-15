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
		emailAddresses,
	};
};
