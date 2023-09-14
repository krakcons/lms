import { buttonVariants } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

const Home = async () => {
	return (
		<main className="mx-auto w-full max-w-screen-lg px-6">
			<div className="flex w-full flex-col items-start justify-center py-2 lg:items-center">
				<div className="mt-20 flex flex-col items-start sm:mt-40 lg:flex-row lg:items-center">
					<h1 className="mb-2 sm:mb-0 sm:text-7xl lg:mr-3">
						Modern Learning
					</h1>
					<h1 className="text-[#75CE9F] sm:text-7xl">For Less</h1>
				</div>
				<div className="mt-6 flex sm:mt-12">
					<p>
						Discover modern, affordable, and easy learning
						management for an empowering educational experience.
					</p>
				</div>
				<SignedIn>
					<Link
						href="/dashboard"
						className={buttonVariants({
							className: "mt-8 sm:mt-12",
						})}
					>
						Dashboard
					</Link>
				</SignedIn>
				<SignedOut>
					<Link
						href="/sign-up"
						className={buttonVariants({
							className: "mt-8 sm:mt-12",
						})}
					>
						Get Started
					</Link>
				</SignedOut>
			</div>
		</main>
	);
};

export default Home;
