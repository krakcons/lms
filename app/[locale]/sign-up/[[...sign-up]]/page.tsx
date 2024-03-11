"use client";

import { SignUp } from "@clerk/nextjs";

const Page = ({ params: { locale } }: { params: { locale: string } }) => {
	return (
		<main className="flex flex-1 items-center justify-center">
			<SignUp
				path={`/${locale}/sign-up`}
				redirectUrl={`/${locale}/dashboard`}
			/>
		</main>
	);
};

export default Page;
