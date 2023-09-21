import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar";

const items = [
	{
		href: "/dashboard/settings/developer",
		title: "Developer",
	},
];

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<h1>Settings</h1>
			<Separator className="my-8" />
			<div className="flex flex-col lg:flex-row">
				<aside className="lg:w-1/5">
					<SidebarNav items={items} />
				</aside>
				<div className="flex-1 px-0 py-8 lg:px-8 lg:py-0">
					{children}
				</div>
			</div>
		</>
	);
};

export default Layout;
