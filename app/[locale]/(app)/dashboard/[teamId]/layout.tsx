import LanguageToggle from "@/components/LanguageToggle";
import UserButton from "@/components/auth/UserButton";
import { Link, redirect } from "@/lib/navigation";
import { getAuth, getTeam } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { usersToTeams } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import TeamSwitcher from "./TeamSwitcher";
import ThemeButton from "./ThemeButton";

const TeamSwitcherServer = async ({
	teamId,
	locale,
}: {
	teamId: string;
	locale: Language;
}) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/dashboard");
	}

	const teamsList = await db.query.usersToTeams.findMany({
		where: eq(usersToTeams.userId, user.id),
		with: {
			team: {
				with: {
					translations: true,
				},
			},
		},
	});

	return (
		<TeamSwitcher
			teams={teamsList.map(({ team }) => team)}
			user={user}
			teamId={teamId}
			locale={locale}
		/>
	);
};

const Layout = async ({
	params: { teamId, locale },
	children,
}: {
	params: {
		teamId: string;
		locale: Language;
	};
	children: React.ReactNode;
}) => {
	const { user } = await getAuth();
	if (!user) {
		return redirect("/auth/google");
	}

	return (
		<div className="flex flex-1 flex-col">
			<header className="border-elevation-2 border-b px-4 py-2">
				<nav className="m-auto flex max-w-screen-xl items-center justify-between">
					<div className="flex items-center justify-center gap-4">
						<Suspense
							fallback={
								<div className="h-10 w-48 rounded bg-muted"></div>
							}
						>
							<TeamSwitcherServer
								teamId={teamId}
								locale={locale}
							/>
						</Suspense>
						<Link
							href={`/dashboard/${teamId}`}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Dashboard
						</Link>
						<Link
							href={`/dashboard/${teamId}/settings/edit`}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Settings
						</Link>
					</div>
					<div className="flex items-center justify-center gap-3">
						<LanguageToggle />
						<ThemeButton />
						<Suspense fallback={null}>
							<UserButton />
						</Suspense>
					</div>
				</nav>
			</header>
			<main className="mx-auto flex w-full min-w-0 max-w-screen-xl flex-1 flex-col p-6 sm:p-12">
				{children}
			</main>
		</div>
	);
};

export default Layout;
