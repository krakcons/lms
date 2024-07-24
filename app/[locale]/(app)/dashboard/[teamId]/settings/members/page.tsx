import { Separator } from "@/components/ui/separator";
import { db } from "@/server/db/db";
import { teams } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { User } from "lucide-react";
import { notFound } from "next/navigation";

const Page = async ({
	params: { teamId },
}: {
	params: {
		teamId: string;
	};
}) => {
	const team = await db.query.teams.findFirst({
		where: eq(teams.id, teamId),
		with: {
			usersToTeams: {
				with: {
					user: true,
				},
			},
		},
	});

	if (!team) {
		return notFound();
	}

	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>Members</h2>
					<p className="text-muted-foreground">
						View and manage the members of your team
					</p>
				</div>
			</div>
			<Separator className="my-8" />
			{team.usersToTeams.map(({ user }) => (
				<div key={user.id} className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
						<User size={20} />
					</div>
					{user.email}
				</div>
			))}
		</>
	);
};

export default Page;
