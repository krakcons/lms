import { TabNav } from "@/components/ui/tabbar";
import {
	FileBadge2,
	Globe,
	Key,
	Languages,
	TriangleAlert,
	Users,
} from "lucide-react";

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
			href: `/dashboard/${teamId}/settings/members`,
			title: "Members",
			icon: <Users size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/edit`,
			title: "Edit",
			icon: <Languages size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/danger`,
			title: "Danger",
			icon: <TriangleAlert size={18} />,
		},
	];

	return (
		<>
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-4 rounded border p-4">
					<div className="flex items-center gap-4">
						<h1>Team settings</h1>
						<p className="rounded bg-muted p-1 px-3 text-sm text-muted-foreground">
							ID: {teamId}
						</p>
					</div>
					<TabNav items={items} />
				</div>
				<div className="flex-1">{children}</div>
			</div>
		</>
	);
};

export default Layout;
