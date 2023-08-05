import UploadForm from "./UploadForm";

type Props = {};

const Page = ({}: Props) => {
	return (
		<main>
			<h1 className="text-2xl sm:text-4xl mb-12">Upload Course</h1>
			<UploadForm />
		</main>
	);
};

export default Page;
