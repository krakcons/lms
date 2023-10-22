"use client";

import { useClerkAppearance } from "@/lib/clerk";
import { SignIn } from "@clerk/nextjs";

const Page = () => {
	const appearance = useClerkAppearance();

	return (
		<main className="flex flex-1 items-center justify-center">
			<SignIn appearance={appearance} />
		</main>
	);
};

export default Page;
