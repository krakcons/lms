import UserButton from "@/components/auth/UserButton";
import { Link } from "@/lib/navigation";
import { Suspense } from "react";
import ThemeButton from "./_components/ThemeButton";

type Props = {
	children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
	return (
		<div className="flex flex-1 flex-col">
			<header className="border-elevation-2 border-b px-4 py-2">
				<nav className="m-auto flex max-w-screen-xl items-center justify-between">
					<div className="flex items-center justify-center gap-4">
						<Link
							href="/dashboard"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Courses
						</Link>
						<Link
							href="/dashboard/settings/api-keys"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Settings
						</Link>
					</div>
					<div className="flex items-center justify-center gap-3">
						<ThemeButton />
						<Suspense fallback={null}>
							<UserButton />
						</Suspense>
					</div>
				</nav>
			</header>
			<main className="mx-auto flex w-full min-w-0 max-w-screen-xl flex-1 flex-col p-6 sm:p-12">
				{children}
			</main>
		</div>
	);
};

export default Layout;
