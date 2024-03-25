import UploadForm from "./UploadForm";

export const runtime = "nodejs";

const Page = ({
	params: { courseId, locale },
}: {
	params: { courseId: string; locale: string };
}) => {
	return (
		<main>
			<h1 className="mb-8">Upload Module</h1>
			<UploadForm courseId={courseId} />
		</main>
	);
};

export default Page;
