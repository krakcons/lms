import CopyButton from "@/components/CopyButton";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAuth } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

const Page = async () => {
	const { getToken, userId, orgId } = getAuth({
		redirect: true,
	});

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
			<h2>API Keys</h2>
			<p className="text-muted-foreground">View and manage API access</p>
			<Separator className="my-8" />
			<Card className="mt-8">
				<CardHeader>
					<CardTitle>API Key</CardTitle>
					<CardDescription>
						Do not distribute this key.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex w-full flex-col">
					<div
						className={buttonVariants({
							variant: "secondary",
							className: "w-full flex-1 justify-between gap-3",
						})}
					>
						<p className="truncate text-sm text-muted-foreground">
							{token
								? "**************" +
								  token.slice(token.length - 5, token.length)
								: "No API key generated yet"}
						</p>
						{token && <CopyButton text={token} />}
					</div>
				</CardContent>
			</Card>
		</>
	);
};

export default Page;
