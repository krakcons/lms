"use client";

import { Link, usePathname } from "@/lib/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
		icon?: React.ReactNode;
	}[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
	const pathname = usePathname();

	return (
		<nav
			className={cn(
				"flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
				className
			)}
			{...props}
		>
			{items.map(({ href, icon, title }) => (
				<Link
					key={href}
					href={href}
					className={cn(
						buttonVariants({ variant: "ghost" }),
						pathname === href
							? "bg-muted hover:bg-muted"
							: "hover:bg-transparent hover:underline",
						"items-center justify-start gap-2"
					)}
				>
					{icon}
					{title}
				</Link>
			))}
		</nav>
	);
}
