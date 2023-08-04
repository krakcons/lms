import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<>
			<header className="border-b border-b-elevation-4 w-full h-14 flex justify-center items-center px-6">
				<nav className="max-w-screen-lg w-full flex justify-end items-center">
					<SignedIn>
						<Link
							href="/dashboard"
							className="border-white rounded py-2 border px-3 text-sm mr-4"
						>
							Dashboard
						</Link>
						<UserButton afterSignOutUrl="/" />
					</SignedIn>
					<SignedOut>
						<Link className="px-4 py-2 rounded mr-4" href="/sign-in">
							Sign In
						</Link>
						<Link href="/sign-up" className="border-white rounded py-2 border px-3">
							Get Started
						</Link>
					</SignedOut>
				</nav>
			</header>
			{children}
		</>
	);
};

export default Layout;
