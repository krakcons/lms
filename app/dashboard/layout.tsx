import { buttonVariants } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserButton } from "@clerk/nextjs";
import { List } from "lucide-react";
import Link from "next/link";
import ThemeButton from "./ThemeButton";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<div className="flex flex-1 flex-col sm:flex-row">
			<div className="border-elevation-2 flex items-center justify-between border-b p-4 sm:flex-col sm:border-b-0 sm:border-r">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href={"/dashboard"}
								className={buttonVariants({
									variant: "outline",
									size: "icon",
								})}
							>
								<List />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Courses</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<div className="flex items-center justify-center sm:flex-col">
					<ThemeButton />
					<UserButton afterSignOutUrl="/" />
				</div>
			</div>
			<main className="mx-auto flex w-full min-w-0 max-w-screen-lg flex-1 flex-col p-6 sm:p-12">
				{children}
			</main>
		</div>
	);
};

export default Layout;
