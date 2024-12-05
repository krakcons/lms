import { TabNav } from "@/components/ui/tabbar";
import { translate } from "@/lib/translation";
import { getUserRole } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { teams } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { eq } from "drizzle-orm";
import {
	FileBadge2,
	Globe,
	Key,
	Languages,
	TriangleAlert,
	Users,
} from "lucide-react";
import { notFound } from "next/navigation";

const Layout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{
		teamId: string;
		locale: Language;
	}>;
}) => {
	const { teamId, locale } = await params;
	const role = await getUserRole(teamId);

	const items = [
		{
			href: `/dashboard/${teamId}/settings/edit`,
			title: "Edit",
			icon: <Languages size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/members`,
			title: "Members",
			icon: <Users size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/certificate`,
			title: "Certificate",
			icon: <FileBadge2 size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/domains`,
			title: "Domains",
			icon: <Globe size={18} />,
		},
		{
			href: `/dashboard/${teamId}/settings/api-keys`,
			title: "API Keys",
			icon: <Key size={18} />,
		},
	];

	if (role === "owner") {
		items.push({
			href: `/dashboard/${teamId}/settings/danger`,
			title: "Danger",
			icon: <TriangleAlert size={18} />,
		});
	}

	const team = await db.query.teams.findFirst({
		where: eq(teams.id, teamId),
		with: {
			translations: true,
		},
	});

	if (!team) {
		return notFound();
	}

	return (
		<>
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-4 rounded border p-4">
					<div className="flex flex-wrap items-center gap-4">
						<h1 className="break-words">
							{translate(team?.translations, locale).name}
						</h1>
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
