import PublicEmailForm from "./_components/PublicEmailForm";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	return (
		<main className="m-auto flex flex-col">
			<h1 className="mb-8">Join this course</h1>
			<PublicEmailForm courseId={courseId} />
		</main>
	);
};

export default Page;
