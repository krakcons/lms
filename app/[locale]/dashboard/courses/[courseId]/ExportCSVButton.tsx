"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { ExpandedLearner } from "@/types/learner";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { Download } from "lucide-react";

const ExportCSVButton = ({
	expandedLearners,
}: {
	expandedLearners: ExpandedLearner[];
}) => {
	const downloadCSV = () => {
		if (expandedLearners.length === 0) {
			toast({
				title: "No users to export",
				description: "There are no users to export.",
			});
		} else {
			const csvConfig = mkConfig({
				useKeysAsHeaders: true,
				filename: "learners",
			});
			const csv = generateCsv(csvConfig)(
				expandedLearners.map(({ score, id, courseId, ...rest }) => {
					let scoreString = "N/A";

					if (score && score.max && score.raw) {
						scoreString = `${score.raw}/${score.max}`;
					}

					return {
						...rest,
						score: scoreString,
					};
				})
			);
			download(csvConfig)(csv);
		}
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="mr-3"
						onClick={downloadCSV}
					>
						<Download />
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
