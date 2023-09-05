"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { parseCourseUserData } from "@/lib/scorm";
import { Course } from "@/types/course";
import { CourseUser } from "@/types/courseUser";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { Download } from "lucide-react";

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const ExportCSVButton = ({
	usersWithVersion,
}: {
	usersWithVersion: (CourseUser & { version: Course["version"] })[];
}) => {
	if (!usersWithVersion) {
		toast({
			title: "No users to export",
			description: "There are no users to export.",
		});
	}

	const csv = generateCsv(csvConfig)(
		usersWithVersion.map(({ data, id, courseId, ...rest }) => {
			const { status, score } = parseCourseUserData(data, rest.version);
			return {
				...rest,
				status,
				...score,
			};
		})
	);

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="mr-3"
						onClick={() => {
							download(csvConfig)(csv);
						}}
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
