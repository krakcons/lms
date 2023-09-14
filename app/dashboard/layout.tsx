import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import OrganizationProfile from "./OrganizationProfile";
import OrganizationSwitcher from "./OrganizationSwitcher";
import ThemeButton from "./ThemeButton";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<div className="flex flex-1 flex-col">
			<nav className="border-elevation-2 flex items-center justify-between border-b px-4 py-2">
				<div className="flex items-center justify-center gap-4">
					<OrganizationSwitcher />
					<Link
						href="/dashboard"
						className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Courses
					</Link>
					<OrganizationProfile />
				</div>
				<div className="flex items-center justify-center gap-3">
					<ThemeButton />
					<UserButton afterSignOutUrl="/" />
				</div>
			</nav>
			<main className="mx-auto flex w-full min-w-0 max-w-screen-lg flex-1 flex-col p-6 sm:p-12">
				{children}
			</main>
		</div>
	);
};

export default Layout;
