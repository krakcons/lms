import { buttonVariants } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<>
			<header className="border-b-elevation-4 flex h-14 w-full items-center justify-center border-b px-6">
				<nav className="flex w-full max-w-screen-lg items-center justify-end">
					<SignedIn>
						<Link
							href="/dashboard"
							className={buttonVariants({ className: "mr-4" })}
						>
							Dashboard
						</Link>
						<UserButton afterSignOutUrl="/" />
					</SignedIn>
					<SignedOut>
						<Link
							href="/sign-in"
							className={buttonVariants({ className: "mr-4" })}
						>
							Sign In
						</Link>
						<Link
							href="/sign-up"
							className={buttonVariants({ className: "mr-4" })}
						>
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
