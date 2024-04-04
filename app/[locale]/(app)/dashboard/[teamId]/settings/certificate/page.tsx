import PDFView from "@/app/[locale]/(app)/play/[teamId]/courses/[courseId]/certificate/PDFView";
import { Separator } from "@/components/ui/separator";
import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { teams } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { eq } from "drizzle-orm";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";

const Page = async ({
	params: { teamId, locale },
}: {
	params: { teamId: string; locale: Language };
}) => {
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
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>Certificate</h2>
					<p className="text-muted-foreground">
						View and manage how certificates are generated
					</p>
				</div>
			</div>
			<Separator className="my-8" />
			<PDFView
				certificate={{
					teamName: translate(team.translations, locale).name,
					name: "John Doe",
					course: "Volunteer Training",
					completedAt: new Date(),
				}}
			/>
		</>
	);
};

export default Page;
