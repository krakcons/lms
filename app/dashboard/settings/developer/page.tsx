import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getAuth } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import CopyKey from "./CopyKey";

const Page = async () => {
	const { getToken, userId, orgId } = getAuth();

	if (!userId) {
		redirect("/sign-in");
	}

	let token = null;

	// If the user is not in an organization, find or generate a personal token
	if (!orgId) {
		const user = await clerkClient.users.getUser(userId);
		let isToken = z.string().safeParse(user.privateMetadata.api_token);

		if (!isToken.success) {
			const newToken = await getToken({ template: "API_TOKEN" });
			await clerkClient.users.updateUserMetadata(userId, {
				privateMetadata: {
					api_token: newToken,
				},
			});
			token = newToken;
		} else {
			token = isToken.data;
		}
	} else {
		const organization = await clerkClient.organizations.getOrganization({
			organizationId: orgId,
		});

		let isToken = z
			.string()
			.safeParse(organization.privateMetadata.api_token);

		if (!isToken.success) {
			const newToken = await getToken({ template: "API_TOKEN" });
			await clerkClient.organizations.updateOrganizationMetadata(
				organization.id,
				{
					privateMetadata: {
						api_token: newToken,
					},
				}
			);
			token = newToken;
		} else {
			token = isToken.data;
		}
	}

	return (
		<>
			<h3>Developer</h3>
			<Card className="mt-8">
				<CardHeader>
					<CardTitle>API Key</CardTitle>
					<CardDescription>
						Do not distribute this key.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{token ? (
						<CopyKey token={token} />
					) : (
						<p>No API key generated yet</p>
					)}
				</CardContent>
			</Card>
		</>
	);
};

export default Page;
