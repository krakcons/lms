import { getAPIAuth } from "@/server/actions/auth";
import { withErrorHandling } from "@/server/api";
import { deleteCourse, getCourse, updateCourse } from "@/server/db/courses";
import { UpdateCourseSchema } from "@/types/course";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(
	async (
		_: Request,
		{ params: { courseId } }: { params: { courseId: string } }
	) => {
		const user = await getAPIAuth();

		const course = await getCourse({ id: courseId }, user.id);

		return NextResponse.json(course);
	}
);

export const PUT = withErrorHandling(
	async (
		req: Request,
		{ params: { courseId } }: { params: { courseId: string } }
	) => {
		const user = await getAPIAuth();

		const newCourse = UpdateCourseSchema.omit({ id: true }).parse(
			await req.json()
		);

		await updateCourse({ ...newCourse, id: courseId }, user.id);

		return NextResponse.json(newCourse);
	}
);

export const DELETE = withErrorHandling(
	async (
		_: Request,
		{ params: { courseId } }: { params: { courseId: string } }
	) => {
		const user = await getAPIAuth();

		await deleteCourse({ id: courseId }, user.id);

		return NextResponse.json(null);
	}
);
