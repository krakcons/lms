import { db } from "@/server/db/db";
import { modules } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import UploadForm from "./UploadForm";

export const runtime = "nodejs";
export const fetchCache = "force-no-store";

const Page = async ({
	params: { courseId, teamId },
}: {
	params: { courseId: string; teamId: string };
}) => {
	const moduleList = await db.query.modules.findMany({
		where: and(eq(modules.courseId, courseId)),
	});

	return (
		<main>
			<h1 className="mb-8">Upload Module</h1>
			<UploadForm
				courseId={courseId}
				teamId={teamId}
				modules={moduleList}
			/>
		</main>
	);
};

export default Page;
