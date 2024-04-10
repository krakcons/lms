import { CertificateProps } from "@/components/Certificate";
import LanguageToggle from "@/components/LanguageToggle";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env.mjs";
import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { playMetadata } from "../metadata";
import DownloadLink from "./DownloadLink";
import PDFView from "./PDFView";

export const generateMetadata = async ({
	params,
}: {
	params: { courseId: string; locale: string; teamId: string };
}) => {
	const t = await getTranslations({ locale: params.locale });
	return playMetadata({
		prefix: `${t("Certificate.title")} `,
		params,
	});
};

const Page = async ({
	params: { locale },
	searchParams: { learnerId },
}: {
	params: {
		locale: string;
	};
	searchParams: {
		learnerId: string;
	};
}) => {
	const learner = await db.query.learners.findFirst({
		where: and(eq(learners.id, learnerId)),
		with: {
			course: {
				with: {
					team: {
						with: {
							translations: true,
						},
					},
					translations: true,
				},
			},
		},
	});

	if (!learner || !learner.completedAt) {
		return notFound();
	}

	const t = await getTranslations({ locale });
	const teamTranslation = translate(learner.course.team.translations, locale);

	const certificate: CertificateProps = {
		name: `${learner.firstName} ${learner.lastName}`,
		course: learner.course.translations[0].name,
		completedAt: learner.completedAt,
		teamName: teamTranslation.name,
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
	};

	return (
		<div className="p-20">
			<div className="flex items-center justify-between">
				<div>
					<h2>{t("Certificate.title")}</h2>
					<p className="text-muted-foreground">
						{t("Certificate.message")}
					</p>
				</div>
				<div className="flex gap-2">
					<LanguageToggle />
					<DownloadLink
						certificate={certificate}
						text={t("Certificate.download")}
					/>
				</div>
			</div>
			<Separator className="my-8" />
			<PDFView certificate={certificate} />
		</div>
	);
};

export default Page;
