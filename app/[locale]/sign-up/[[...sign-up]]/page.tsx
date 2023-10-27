"use client";

import { useClerkAppearance } from "@/lib/clerk";
import { SignUp } from "@clerk/nextjs";

const Page = ({ params: { locale } }: { params: { locale: string } }) => {
	const appearance = useClerkAppearance();
	return (
		<main className="flex flex-1 items-center justify-center">
			<SignUp appearance={appearance} path={`/${locale}/sign-up`} />
		</main>
	);
};

export default Page;
