import UserButton from "@/components/auth/UserButton";
import { Link, redirect } from "@/lib/navigation";
import { getAuth, getTeam } from "@/server/actions/auth";
import { db } from "@/server/db/db";
import { usersToTeams } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import TeamSwitcher from "./TeamSwitcher";
import ThemeButton from "./ThemeButton";

const TeamSwitcherServer = async ({ teamId }: { teamId: string }) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/dashboard");
	}

	const teamsList = await db.query.teams.findMany({
		with: {
			usersToTeams: {
				where: eq(usersToTeams.userId, user.id),
			},
		},
	});

	return <TeamSwitcher teams={teamsList} user={user} />;
};

const Layout = async ({
	params: { teamId },
	children,
}: {
	params: {
		teamId: string;
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
						{/* <Suspense>
							<TeamSwitcherServer teamId={teamId} />
						</Suspense> */}
						<Link
							href={`/dashboard/${teamId}`}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Dashboard
						</Link>
						<Link
							href={`/dashboard/${teamId}/settings/api-keys`}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
						>
							Settings
						</Link>
					</div>
					<div className="flex items-center justify-center gap-3">
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
