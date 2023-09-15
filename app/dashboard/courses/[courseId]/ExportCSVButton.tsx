"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { CourseUserWithExpandedData } from "@/lib/course-users";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { Download } from "lucide-react";

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const ExportCSVButton = ({
	expandedUsers,
}: {
	expandedUsers: CourseUserWithExpandedData[];
}) => {
	const downloadCSV = () => {
		if (expandedUsers.length === 0) {
			toast({
				title: "No users to export",
				description: "There are no users to export.",
			});
		} else {
			const csv = generateCsv(csvConfig)(
				expandedUsers.map(({ score, id, courseId, ...rest }) => {
					return {
						...rest,
						...score,
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
