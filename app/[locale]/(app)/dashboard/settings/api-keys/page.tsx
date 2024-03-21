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
import { getAuth } from "@/server/actions/cached";
import { db } from "@/server/db/db";
import { keys } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { APIKeyCell, AddKeyDialog, DeleteKeyButton } from "./client";

const Keys = async () => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const keysList = await db.query.keys.findMany({
		where: eq(keys.userId, user.id),
	});

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

const Page = async () => {
	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>API Keys</h2>
					<p className="text-muted-foreground">
						View and manage API access
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
					<Keys />
				</Suspense>
			</Table>
		</>
	);
};

export default Page;
