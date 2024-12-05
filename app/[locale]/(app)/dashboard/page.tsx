import { redirect } from "@/lib/navigation";
import { getAuth } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { usersToTeams } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

const Page = async () => {
	const { user } = await getAuth();
	if (!user) {
		return redirect("/auth/google");
	}

	const cookieStore = await cookies();
	const teamId = cookieStore.get("teamId");

	// If team cookie check for team and redirect
	if (teamId) {
		const userToTeam = await db.query.usersToTeams.findFirst({
			where: and(
				eq(usersToTeams.userId, user.id),
				eq(usersToTeams.teamId, teamId.value)
			),
			with: {
				team: true,
			},
		});

		if (userToTeam?.team) {
			return redirect(`/dashboard/${userToTeam.team.id}`);
		}
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

	if (teamsList.length === 0) {
		return redirect("/dashboard/create");
	} else {
		return redirect(`/dashboard/${teamsList[0].team.id}`);
	}
};

export default Page;
