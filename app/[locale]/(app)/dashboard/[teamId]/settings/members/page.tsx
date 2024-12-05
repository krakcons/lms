import { Separator } from "@/components/ui/separator";
import { getAuth, getUserRole } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { teams } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { User } from "lucide-react";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { AddMemberDialog } from "./AddMemberDialog";
import DeleteMember from "./DeleteMember";

const Page = async ({ params }: { params: Promise<{ teamId: string }> }) => {
	const { teamId } = await params;
	unstable_noStore();
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

	const currentUser = await getAuth();
	const role = await getUserRole(teamId);

	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>Members</h2>
					<p className="text-muted-foreground">
						View and manage the members of your team
					</p>
				</div>
				{role === "owner" && <AddMemberDialog teamId={teamId} />}
			</div>
			<Separator className="my-8" />
			<div className="flex flex-col gap-4">
				{team.usersToTeams.map((member) => (
					<div
						key={member.user.id}
						className="flex items-center justify-between gap-3"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
								<User size={20} />
							</div>
							<p>{member.user.email}</p>
						</div>
						<div className="flex items-center gap-3">
							<p className="text-muted-foreground">
								{member.role[0].toUpperCase() +
									member.role.slice(1)}
							</p>
							{role === "owner" &&
								currentUser.user?.id !== member.user.id && (
									<DeleteMember
										userId={member.user.id}
										teamId={teamId}
									/>
								)}
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default Page;
