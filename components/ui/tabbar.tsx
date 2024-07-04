"use client";

import { Link, usePathname } from "@/lib/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
		icon?: React.ReactNode;
	}[];
}

export function TabNav({ items }: TabNavProps) {
	const pathname = usePathname();

	return (
		<Tabs defaultValue={pathname}>
			<TabsList>
				{items.map(({ href, icon, title }) => (
					<TabsTrigger key={href} value={href} asChild>
						<Link key={href} href={href} className="gap-2">
							{icon}
							{title}
						</Link>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
