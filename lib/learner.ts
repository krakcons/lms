import { Learner } from "@/types/learner";
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

export const statusLabels = {
	"not-started": "Not Started",
	"in-progress": "In Progress",
	passed: "Passed",
	failed: "Failed",
};

export const scoreLabel = (score: Learner["score"]) => {
	if (score && score.max && score.raw) {
		return `${score.raw}/${score.max}`;
	} else {
		return "N/A";
	}
};
