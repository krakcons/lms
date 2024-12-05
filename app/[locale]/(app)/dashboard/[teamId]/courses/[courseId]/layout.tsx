import { TabNav } from "@/components/ui/tabbar";
import { redirect } from "@/lib/navigation";
import { translate } from "@/lib/translation";
import { getAuth } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { courses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { File, Languages, Settings, Users, Webhook } from "lucide-react";
import { notFound } from "next/navigation";

const Layout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ courseId: string; teamId: string; locale: string }>;
}) => {
	const { courseId, teamId, locale } = await params;
	const items = [
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

	const course = await db.query.courses.findFirst({
		where: eq(courses.id, courseId),
		with: {
			translations: true,
		},
	});

	if (!course) {
		return notFound();
	}

	return (
		<>
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-4 rounded border p-4">
					<div className="flex flex-wrap items-center gap-4">
						<h1 className="break-words">
							{translate(course.translations, locale).name}
						</h1>
						<p className="rounded bg-muted p-1 px-3 text-sm text-muted-foreground">
							ID: {course.id}
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
