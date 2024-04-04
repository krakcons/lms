import { CertificateProps } from "@/components/Certificate";
import { Separator } from "@/components/ui/separator";
import { translate } from "@/lib/translation";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import DownloadLink from "./DownloadLink";
import PDFView from "./PDFView";

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
	console;
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

	const certificate: CertificateProps = {
		name: `${learner.firstName} ${learner.lastName}`,
		course: learner.course.translations[0].name,
		completedAt: learner.completedAt,
		teamName: translate(learner.course.team.translations, locale).name,
	};

	return (
		<div className="p-20">
			<div className="flex items-center justify-between">
				<div>
					<h2>View Certificate</h2>
					<p className="text-muted-foreground">
						Download and view your certificate here!
					</p>
				</div>
				<DownloadLink certificate={certificate} />
			</div>
			<Separator className="my-8" />
			<PDFView certificate={certificate} />
		</div>
	);
};

export default Page;
