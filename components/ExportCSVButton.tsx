"use client";

import { Button } from "@/components/ui/button";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { Download } from "lucide-react";

const ExportCSVButton = ({
	data,
	filename,
}: {
	data: any;
	filename: string;
}) => {
	const downloadCSV = () => {
		const csvConfig = mkConfig({
			useKeysAsHeaders: true,
			filename,
		});
		const csv = generateCsv(csvConfig)(data);
		download(csvConfig)(csv);
	};

	return (
		<Button variant="outline" className="gap-2" onClick={downloadCSV}>
			<Download size={18} />
			Export
		</Button>
	);
};

export default ExportCSVButton;
