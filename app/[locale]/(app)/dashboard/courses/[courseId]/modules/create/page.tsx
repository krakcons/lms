import UploadForm from "./_components/UploadForm";

export const runtime = "nodejs";

const Page = ({ params: { courseId } }: { params: { courseId: string } }) => {
	return (
		<main>
			<h1 className="mb-8">Upload Module</h1>
			<UploadForm courseId={courseId} />
		</main>
	);
};

export default Page;
