"use client";

import { SignIn } from "@clerk/nextjs";

const Page = ({ params: { locale } }: { params: { locale: string } }) => {
	return (
		<main className="flex flex-1 items-center justify-center">
			<SignIn
				path={`/${locale}/sign-in`}
				redirectUrl={`/${locale}/dashboard`}
			/>
		</main>
	);
};

export default Page;
