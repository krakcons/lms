import { SidebarNav } from "@/components/ui/sidebar";

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
		},
		{
			href: `/dashboard/courses/${courseId}/learners`,
			title: "Learners",
		},
		{
			href: `/dashboard/courses/${courseId}/webhooks`,
			title: "Webhooks",
		},
		{
			href: `/dashboard/courses/${courseId}/settings`,
			title: "Settings",
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
