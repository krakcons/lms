import { buttonVariants } from "@/components/ui/button";

type Props = {
	children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
	return (
		<>
			<header className="border-b-elevation-4 flex h-14 w-full items-center justify-center border-b px-6">
				<nav className="flex w-full max-w-screen-lg items-center justify-end">
					<a
						href="/auth/google"
						className={buttonVariants({
							className: "mr-4",
						})}
					>
						Get Started
					</a>
				</nav>
			</header>
			{children}
		</>
	);
};

export default Layout;
