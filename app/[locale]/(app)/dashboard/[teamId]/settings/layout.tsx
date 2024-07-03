import { SidebarNav } from "@/components/ui/sidebar";
import { FileBadge2, Globe, Key, Languages } from "lucide-react";

const Layout = ({
	children,
	params: { teamId },
}: {
	children: React.ReactNode;
	params: {
		teamId: string;
	};
}) => {
	const items = [
		{
			href: `/dashboard/${teamId}/settings/api-keys`,
			title: "API Keys",
			icon: <Key size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/domains`,
			title: "Domains",
			icon: <Globe size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/certificate`,
			title: "Certificate",
			icon: <FileBadge2 size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/edit`,
			title: "Edit",
			icon: <Languages size={18} />,
		},
	];

	return (
		<>
			<div className="flex flex-col lg:flex-row">
				<aside className="lg:w-48 lg:max-w-48">
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
