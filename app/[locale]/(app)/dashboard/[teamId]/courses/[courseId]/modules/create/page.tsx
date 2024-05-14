import UploadForm from "./UploadForm";

export const runtime = "nodejs";
export const fetchCache = "force-no-store";

const Page = ({
	params: { courseId, teamId },
}: {
	params: { courseId: string; teamId: string };
}) => {
	return (
		<main>
			<h1 className="mb-8">Upload Module</h1>
			<UploadForm courseId={courseId} teamId={teamId} />
		</main>
	);
};

export default Page;
