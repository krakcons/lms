import { SignUp } from "@clerk/nextjs";

const Page = () => {
	return (
		<main className="flex justify-center items-center flex-1">
			<SignUp afterSignUpUrl="/dashboard" afterSignInUrl="/dashboard" />
		</main>
	);
};

export default Page;
