"use client";

import { Certificate, CertificateProps } from "@/components/Certificate";
import { buttonVariants } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileBadge2 } from "lucide-react";

const DownloadLink = ({ certificate }: { certificate: CertificateProps }) => {
	return (
		<PDFDownloadLink
			document={<Certificate {...certificate} />}
			fileName="certificate.pdf"
			className={buttonVariants({})}
		>
			{({ loading }) => (
				<>
					<FileBadge2 size={20} />
					{loading ? "Loading document..." : "Download certificate"}
				</>
			)}
		</PDFDownloadLink>
	);
};

export default DownloadLink;
