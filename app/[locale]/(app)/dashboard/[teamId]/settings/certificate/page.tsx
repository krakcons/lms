import PDFView from "@/app/[locale]/(app)/play/[teamId]/courses/[courseId]/certificate/PDFView";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env.mjs";
import { formatDate } from "@/lib/date";
import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { teams } from "@/server/db/schema";
import { Language } from "@/types/translations";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
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

	const t = await getTranslations({ locale });
	const teamTranslation = translate(team.translations, locale);

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
					teamName: teamTranslation.name,
					name: "John Doe",
					course: "Volunteer Training",
					completedAt: formatDate(new Date(), locale),
					text: {
						title: t("Certificate.pdf.title"),
						message: t("Certificate.pdf.message"),
						congratulations: {
							1: t("Certificate.pdf.congratulations.1"),
							2: t("Certificate.pdf.congratulations.2"),
						},
						date: t("Certificate.pdf.date"),
					},
					logo: teamTranslation.logo
						? `${env.NEXT_PUBLIC_R2_URL}/${teamTranslation.logo}`
						: undefined,
				}}
			/>
		</>
	);
};

export default Page;
