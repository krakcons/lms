import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<div className="flex flex-1 flex-col sm:flex-row">
			<div className="flex items-center justify-between border-b border-elevation-2 p-4 sm:flex-col sm:border-b-0 sm:border-r">
				<Link
					href={"/dashboard"}
					className="h-10 w-10 rounded-xl bg-elevation-2"
				></Link>
				<UserButton afterSignOutUrl="/" />
			</div>
			<main className="mx-auto flex w-full min-w-0 max-w-screen-lg flex-1 flex-col p-6 sm:p-12">
				{children}
			</main>
		</div>
	);
};

export default Layout;
