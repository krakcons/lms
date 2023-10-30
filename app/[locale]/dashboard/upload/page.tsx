import UploadForm from "./_components/UploadForm";

const Page = () => {
	return (
		<main>
			<h1 className="mb-4">Upload Course</h1>
			<p className="mb-12 text-muted-foreground">
				Currently supports version 1.2 (New versions coming soon)
			</p>
			<UploadForm />
		</main>
	);
};

export default Page;
