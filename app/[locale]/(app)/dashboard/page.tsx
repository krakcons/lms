import { redirect } from "@/lib/navigation";
import { getAuth } from "@/server/actions/cached";
import { db } from "@/server/db/db";
import { teams, usersToTeams } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const Page = async () => {
	const { user } = await getAuth();
	if (!user) {
		return redirect("/auth/google");
	}

	let id;
	const team = await db.query.teams.findFirst({
		with: {
			usersToTeams: {
				where: eq(usersToTeams.userId, user.id),
			},
		},
	});
	id = team?.id;

	if (!team) {
		await db.insert(teams).values({
			id: user.id,
			name: "Personal",
		});
		id = "personal";
	}

	return redirect(`/dashboard/${id}`);
};

export default Page;
