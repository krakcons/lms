"use client";

import { useClerk, useOrganization } from "@clerk/nextjs";

const TeamProfile = () => {
	const { openOrganizationProfile } = useClerk();
	const { organization } = useOrganization();

	if (!organization) return null;

	return (
		<button
			onClick={() => openOrganizationProfile()}
			className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
		>
			Team
		</button>
	);
};

export default TeamProfile;
