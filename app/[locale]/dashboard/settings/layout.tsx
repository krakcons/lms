import { SidebarNav } from "@/components/ui/sidebar";
import { Key } from "lucide-react";

const items = [
	{
		href: "/dashboard/settings/api-keys",
		title: "API Keys",
		icon: <Key size={18} />,
	},
];

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
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
