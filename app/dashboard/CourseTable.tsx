"use client";

import { DataTable } from "@/components/ui/data-table";
import { Course } from "@/types/course";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

const columnHelper = createColumnHelper<Course>();

export const columns = [
	columnHelper.accessor("name", {
		header: "Name",
	}),
	columnHelper.accessor("version", {
		header: "Version",
	}),
];

type Props = {
	data: Course[];
};

const CourseTable = ({ data }: Props) => {
	const router = useRouter();
	return (
		<DataTable
			data={data}
			columns={columns}
			onRowClick={(row) => router.push(`/dashboard/courses/${row.id}`)}
		/>
	);
};

export default CourseTable;
