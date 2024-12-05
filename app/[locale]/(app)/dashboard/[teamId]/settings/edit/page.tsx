import { EditTeamForm } from "@/components/team/EditTeamForm";
import { db } from "@/server/db/db";
import { teams } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { eq } from "drizzle-orm";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";

const Page = async ({
	params,
}: {
	params: Promise<{
		locale: Language;
		teamId: string;
	}>;
}) => {
	const { locale, teamId } = await params;
	unstable_noStore();
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
		<EditTeamForm
			translations={team.translations}
			language={locale}
			teamId={teamId}
		/>
	);
};

export default Page;
