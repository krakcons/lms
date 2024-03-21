import { withErrorHandling } from "@/server/api";
import { deleteLearner, getLearner, updateLearner } from "@/server/db/learners";
import { UpdateLearnerSchema } from "@/types/learner";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(
	async (
		_: Request,
		{
			params: { courseId, learnerId },
		}: {
			params: { courseId: string; learnerId: string };
		}
	) => {
		const learner = await getLearner({ id: learnerId, courseId });

		return NextResponse.json(learner);
	}
);

export const PUT = withErrorHandling(
	async (
		req: Request,
		{
			params: { courseId, learnerId },
		}: { params: { courseId: string; learnerId: string } }
	) => {
		const { data } = UpdateLearnerSchema.omit({
			courseId: true,
			id: true,
		}).parse(await req.json());

		const newLearner = await updateLearner({
			id: learnerId,
			courseId,
			data,
		});

		return NextResponse.json(newLearner);
	}
);

export const DELETE = withErrorHandling(
	async (
		_: Request,
		{
			params: { courseId, learnerId },
		}: {
			params: { courseId: string; learnerId: string };
		}
	) => {
		await deleteLearner({ id: learnerId, courseId });
		return NextResponse.json(null);
	}
);
