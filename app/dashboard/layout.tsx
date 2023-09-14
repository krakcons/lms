import { buttonVariants } from "@/components/ui/button";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import ThemeButton from "./ThemeButton";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<div className="flex flex-1 flex-col">
			<nav className="border-elevation-2 flex items-center justify-between border-b px-4 py-2">
				<Link
					href={"/dashboard"}
					className={buttonVariants({
						variant: "ghost",
						size: "sm",
					})}
				>
					Courses
				</Link>
				<div className="flex items-center justify-center gap-2">
					<ThemeButton />
					<OrganizationSwitcher />
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
