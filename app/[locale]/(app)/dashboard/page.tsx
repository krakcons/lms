import { redirect } from "@/lib/navigation";
import { getAuth } from "@/server/actions/auth";
import { db } from "@/server/db/db";
import { teams, usersToTeams } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const Page = async () => {
	const { user } = await getAuth();
	if (!user) {
		return redirect("/auth/google");
	}

	let id;
	const userToTeam = await db.query.usersToTeams.findFirst({
		where: eq(usersToTeams.userId, user.id),
		with: {
			team: true,
		},
	});
	id = userToTeam?.team?.id;

	if (!id) {
		await db.insert(teams).values({
			id: user.id,
			name: "Personal",
		});
		await db.insert(usersToTeams).values({
			userId: user.id,
			teamId: user.id,
		});
		id = "personal";
	}

	return redirect(`/dashboard/${id}`);
};

export default Page;
