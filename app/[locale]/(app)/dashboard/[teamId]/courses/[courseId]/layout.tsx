import { SidebarNav } from "@/components/ui/sidebar";
import { redirect } from "@/lib/navigation";
import { getAuth } from "@/server/auth/actions";
import { coursesData } from "@/server/db/courses";
import { LCDSError } from "@/server/errors";
import { File, Home, Languages, Settings, Users, Webhook } from "lucide-react";
import { notFound } from "next/navigation";

const Layout = async ({
	children,
	params: { courseId, teamId },
}: {
	children: React.ReactNode;
	params: { courseId: string; teamId: string };
}) => {
	const items = [
		{
			href: `/dashboard/${teamId}/courses/${courseId}`,
			title: "Home",
			icon: <Home size={18} />,
		},
		{
			href: `/dashboard/${teamId}/courses/${courseId}/learners`,
			title: "Learners",
			icon: <Users size={18} />,
		},
		{
			href: `/dashboard/${teamId}/courses/${courseId}/modules`,
			title: "Modules",
			icon: <File size={18} />,
		},
		{
			href: `/dashboard/${teamId}/courses/${courseId}/webhooks`,
			title: "Webhooks",
			icon: <Webhook size={18} />,
		},
		{
			href: `/dashboard/${teamId}/courses/${courseId}/edit`,
			title: "Edit",
			icon: <Languages size={18} />,
		},
		{
			href: `/dashboard/${teamId}/courses/${courseId}/settings`,
			title: "Settings",
			icon: <Settings size={18} />,
		},
	];

	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	let course;
	try {
		course = await coursesData.get({ id: courseId }, user.id);
	} catch (error) {
		if (error instanceof LCDSError && error.code === "NOT_FOUND") {
			return notFound();
		}
		throw error;
	}

	return (
		<>
			<div className="flex flex-col lg:flex-row">
				<aside className="lg:w-32">
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
