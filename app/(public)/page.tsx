import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

const Home = async () => {
	return (
		<main className="max-w-screen-lg px-6 w-full mx-auto">
			<div className="flex flex-col items-start lg:items-center justify-center py-2 w-full">
				<div className="flex items-start flex-col lg:flex-row lg:items-center mt-20 sm:mt-40">
					<h1 className="text-[40px] sm:text-7xl lg:mr-4">Modern Learning</h1>
					<h1 className="text-[40px] sm:text-7xl font-bold sm:mt-6 lg:mt-0 text-[#75CE9F]">
						For Less
					</h1>
				</div>
				<div className="flex mt-6 sm:mt-12 lg:text-center sm:text-lg">
					Discover modern, affordable, and easy learning management for an empowering
					educational experience.
				</div>
				<SignedIn>
					<Link href="/dashboard" className="btn mt-8 sm:mt-12">
						Dashboard
					</Link>
				</SignedIn>
				<SignedOut>
					<Link href="/sign-up" className="btn mt-8 sm:mt-12">
						Get Started
					</Link>
				</SignedOut>
			</div>
		</main>
	);
};

export default Home;
