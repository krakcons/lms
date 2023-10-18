"use client";

import { useClerkAppearance } from "@/lib/clerk";
import { useClerk, useOrganization } from "@clerk/nextjs";

const TeamProfile = () => {
	const { openOrganizationProfile } = useClerk();
	const { organization } = useOrganization();
	const appearance = useClerkAppearance();

	if (!organization) return null;

	console.log("TeamProfile", organization, appearance);

	return (
		<button
			onClick={() =>
				openOrganizationProfile({
					appearance,
				})
			}
			className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
		>
			Team
		</button>
	);
};

export default TeamProfile;
