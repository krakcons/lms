"use client";

import { useClerkAppearance } from "@/lib/clerk";
import { SignUp } from "@clerk/nextjs";

const Page = () => {
	const appearance = useClerkAppearance();
	return (
		<main className="flex flex-1 items-center justify-center">
			<SignUp appearance={appearance} />
		</main>
	);
};

export default Page;
