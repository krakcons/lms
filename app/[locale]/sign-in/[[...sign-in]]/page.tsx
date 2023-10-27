"use client";

import { useClerkAppearance } from "@/lib/clerk";
import { SignIn } from "@clerk/nextjs";

const Page = ({ params: { locale } }: { params: { locale: string } }) => {
	const appearance = useClerkAppearance();

	return (
		<main className="flex flex-1 items-center justify-center">
			<SignIn appearance={appearance} path={`/${locale}/sign-in`} />
		</main>
	);
};

export default Page;
