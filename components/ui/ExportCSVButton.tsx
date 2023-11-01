"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline" size="icon" onClick={downloadCSV}>
						<Download size={18} />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Export to CSV</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default ExportCSVButton;
