"use client";

import { parseCourseUserData } from "@/lib/scorm";
import { Course } from "@/types/course";
import { CourseUser } from "@/types/courseUser";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<
	CourseUser & { version: Course["version"] }
>();

export const columns = [
	columnHelper.accessor("email", {
		header: "User",
	}),
	columnHelper.accessor("data", {
		header: "Status",
		cell: (info) => {
			return parseCourseUserData(
				info.row.original.data,
				info.row.original.version
			).status;
		},
	}),
	columnHelper.accessor("data", {
		header: "Score",
		cell: (info) => {
			const score = parseCourseUserData(
				info.row.original.data,
				info.row.original.version
			).score;

			if (score && score.max && score.raw) {
				return `${score.raw}/${score.max}`;
			} else {
				return "N/A";
			}
		},
	}),
];
