import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { getAuth } from "@/server/actions/cached";

type Props = {
	children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
	const { user } = await getAuth();

	return (
		<>
			<header className="border-b-elevation-4 flex h-14 w-full items-center justify-center border-b px-6">
				<nav className="flex w-full max-w-screen-lg items-center justify-end">
					{user ? (
						<>
							<Link
								href="/dashboard"
								className={buttonVariants({
									className: "mr-4",
								})}
							>
								Dashboard
							</Link>
						</>
					) : (
						<>
							<a
								href="/auth/google"
								className={buttonVariants({
									className: "mr-4",
								})}
							>
								Get Started
							</a>
						</>
					)}
				</nav>
			</header>
			{children}
		</>
	);
};

export default Layout;
