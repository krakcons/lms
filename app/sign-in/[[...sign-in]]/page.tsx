import { SignIn } from "@clerk/nextjs";

const Page = () => {
	return (
		<main className="flex justify-center items-center flex-1">
			<SignIn afterSignInUrl="/dashboard" />
		</main>
	);
};

export default Page;
