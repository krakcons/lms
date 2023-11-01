import { SidebarNav } from "@/components/ui/sidebar";
import { Cog, Home, Users, Webhook } from "lucide-react";

const items = [
	{
		href: "/dashboard/courses/:courseId",
		title: "Home",
	},
];

const Layout = ({
	children,
	params: { courseId },
}: {
	children: React.ReactNode;
	params: { courseId: string };
}) => {
	const items = [
		{
			href: `/dashboard/courses/${courseId}`,
			title: "Home",
			icon: <Home size={18} />,
		},
		{
			href: `/dashboard/courses/${courseId}/learners`,
			title: "Learners",
			icon: <Users size={18} />,
		},
		{
			href: `/dashboard/courses/${courseId}/webhooks`,
			title: "Webhooks",
			icon: <Webhook size={18} />,
		},
		{
			href: `/dashboard/courses/${courseId}/settings`,
			title: "Settings",
			icon: <Cog size={18} />,
		},
	];

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
