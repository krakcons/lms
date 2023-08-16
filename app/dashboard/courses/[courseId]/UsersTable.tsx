"use client";

import { parseCourseUserData } from "@/libs/scorm";
import { Course } from "@/types/course";
import { CourseUser, FullCourseUser } from "@/types/courseUser";
import { WithUser } from "@/types/users";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { useMemo } from "react";

type Props = {
	courseUsers: WithUser<CourseUser>[];
	version: Course["version"];
};

const columnHelper = createColumnHelper<FullCourseUser>();

const columns = [
	columnHelper.accessor("user", {
		header: "User",
		cell: (info) => (
			<div className="flex items-center">
				<Image
					src={info.getValue().imageUrl}
					height={40}
					width={40}
					className="mr-4 rounded-full"
					alt="User Image"
				/>
				<span>
					<p className="text-sm sm:text-base">
						{info.getValue().firstName} {info.getValue().lastName}
					</p>
					{info.getValue().emailAddress && (
						<p className="mt-1 text-xs opacity-70 sm:text-sm">
							{info.getValue().emailAddress}
						</p>
					)}
				</span>
			</div>
		),
	}),
	columnHelper.accessor("data.status", {
		header: "Status",
		cell: (info) => <p className="text-xs sm:text-sm">{info.getValue()}</p>,
	}),
	columnHelper.accessor("data.score", {
		header: "Score",
		cell: (info) => {
			const score = info.getValue();

			if (score && score.max && score.raw) {
				return (
					<p className="text-xs sm:text-sm">
						{`${score.raw}/${score.max}`}
					</p>
				);
			} else {
				return <p className="text-xs sm:text-sm">N/A</p>;
			}
		},
	}),
];

const UsersTable = ({ courseUsers, version }: Props) => {
	const data = useMemo(() => {
		return courseUsers.map((courseUser) => {
			return {
				...courseUser,
				data: parseCourseUserData(courseUser.data, version),
			};
		});
	}, [courseUsers, version]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[400px] ">
				<thead className="mb-4 h-14 border-b border-elevation-4">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="text-left">
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
										  )}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="h-20">
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default UsersTable;
