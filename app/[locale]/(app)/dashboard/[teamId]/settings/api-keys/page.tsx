import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { redirect } from "@/lib/navigation";
import { getAuth, getTeam } from "@/server/auth/actions";
import { db } from "@/server/db/db";
import { keys } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { APIKeyCell, AddKeyDialog, DeleteKeyButton } from "./client";

const Keys = async ({ teamId }: { teamId: string }) => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const team = await getTeam(teamId, user.id);

	if (!team) {
		return redirect("/404");
	}

	const keysList = await db.query.keys.findMany({
		where: eq(keys.teamId, team.id),
	});

	console.log("keysList", keysList);

	return (
		<TableBody>
			{keysList.map((key) => (
				<TableRow key={key.id}>
					<TableCell className="font-medium">{key.name}</TableCell>
					<TableCell>
						<APIKeyCell secret={key.key} />
					</TableCell>
					<TableCell className="text-right">
						<DeleteKeyButton id={key.id} />
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	);
};

const Page = async ({ params: { teamId } }: { params: { teamId: string } }) => {
	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>API Keys</h2>
					<p className="text-muted-foreground">
						View and manage API access. View the API documentation{" "}
						<a
							href="https://documenter.getpostman.com/view/26552546/2sA2xmWBe6#c4113410-46e0-42bf-98b4-4a23d4dbe632"
							className="text-blue-500 underline"
							target="_blank"
						>
							here
						</a>
						.
					</p>
				</div>
				<AddKeyDialog />
			</div>
			<Separator className="my-8" />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[200px]">Name</TableHead>
						<TableHead className="flex-1">Key</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense>
					<Keys teamId={teamId} />
				</Suspense>
			</Table>
		</>
	);
};

export default Page;
