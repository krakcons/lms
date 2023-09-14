import { SignUp } from "@clerk/nextjs";

const Page = () => {
	return (
		<main className="flex flex-1 items-center justify-center">
			<SignUp />
		</main>
	);
};

export default Page;
