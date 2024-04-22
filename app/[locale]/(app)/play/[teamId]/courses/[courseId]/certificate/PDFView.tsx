"use client";

import { Certificate, CertificateProps } from "@/components/Certificate";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
	() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
	{
		ssr: false,
		loading: () => <p>Loading...</p>,
	}
);

const PDFView = ({ certificate }: { certificate: CertificateProps }) => {
	return (
		<PDFViewer className="h-[700px] w-full">
			<Certificate {...certificate} />
		</PDFViewer>
	);
};

export default PDFView;
