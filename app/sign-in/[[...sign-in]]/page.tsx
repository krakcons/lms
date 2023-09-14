import { SignIn } from "@clerk/nextjs";

const Page = () => {
	return (
		<main className="flex flex-1 items-center justify-center">
			<SignIn />
		</main>
	);
};

export default Page;
