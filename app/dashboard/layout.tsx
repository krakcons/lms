import UserButton from "@/components/auth/UserButton";
import Link from "next/link";
import TeamProfile from "../../components/auth/TeamProfile";
import TeamSwitcher from "../../components/auth/TeamSwitcher";
import ThemeButton from "./ThemeButton";

export const runtime = "edge";
export const preferredRegion = "us-east-2";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<div className="flex flex-1 flex-col">
			<header className="border-elevation-2 border-b px-4 py-2">
				<nav className="m-auto flex max-w-screen-xl items-center justify-between">
					<div className="flex items-center justify-center gap-4">
						<TeamSwitcher />
						<Link
							href="/dashboard"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Courses
						</Link>
						<TeamProfile />
						<Link
							href="/dashboard/settings/developer"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Settings
						</Link>
					</div>
					<div className="flex items-center justify-center gap-3">
						<ThemeButton />
						<UserButton />
					</div>
				</nav>
			</header>
			<main className="mx-auto flex w-full min-w-0 max-w-screen-lg flex-1 flex-col p-6 sm:p-12">
				{children}
			</main>
		</div>
	);
};

export default Layout;
