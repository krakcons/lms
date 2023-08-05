import { UserButton } from "@clerk/nextjs";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<div className="flex flex-1 flex-col sm:flex-row">
			<nav className="flex p-4 sm:flex-col justify-between items-center border-b sm:border-b-0 sm:border-r border-elevation-2">
				<div className="w-10 h-10 bg-elevation-2 rounded-xl" />
				<UserButton afterSignOutUrl="/" />
			</nav>
			<main className="max-w-screen-lg mx-auto w-full p-6 sm:p-12">{children}</main>
		</div>
	);
};

export default Layout;
