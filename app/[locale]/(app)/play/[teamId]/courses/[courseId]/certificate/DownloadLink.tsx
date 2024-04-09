"use client";

import { Certificate, CertificateProps } from "@/components/Certificate";
import { buttonVariants } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileBadge2 } from "lucide-react";

const DownloadLink = ({
	certificate,
	text,
}: {
	certificate: CertificateProps;
	text: string;
}) => {
	return (
		<PDFDownloadLink
			document={<Certificate {...certificate} />}
			fileName="certificate.pdf"
			className={buttonVariants({})}
		>
			{() => (
				<>
					<FileBadge2 size={20} />
					{text}
				</>
			)}
		</PDFDownloadLink>
	);
};

export default DownloadLink;
