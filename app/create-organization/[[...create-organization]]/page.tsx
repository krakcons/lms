import { CreateOrganization } from "@clerk/nextjs";

const CreateOrganizationPage = () => {
	return (
		<main className="flex flex-1 items-center justify-center">
			<CreateOrganization
				afterCreateOrganizationUrl="/dashboard"
				skipInvitationScreen
				path="/create-organization"
			/>
		</main>
	);
};

export default CreateOrganizationPage;
