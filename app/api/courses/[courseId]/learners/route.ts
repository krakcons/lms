import { getAPIAuth } from "@/server/actions/auth";
import { withErrorHandling } from "@/server/api";
import { createLearner, getLearners } from "@/server/db/learners";
import { CreateLearnerSchema, ExtendLearner } from "@/types/learner";
import { NextResponse } from "next/server";

export const POST = withErrorHandling(
	async (
		req: Request,
		{
			params: { courseId },
		}: {
			params: { courseId: string };
		}
	) => {
		const input = CreateLearnerSchema.omit({
			courseId: true,
		}).parse(await req.json());

		const learner = await createLearner({
			...input,
			courseId,
		});

		return NextResponse.json(ExtendLearner.parse(learner));
	}
);

export const GET = withErrorHandling(
	async (
		_: Request,
		{
			params: { courseId },
		}: {
			params: { courseId: string };
		}
	) => {
		const user = await getAPIAuth();

		const learners = await getLearners({ courseId }, user.id);

		return NextResponse.json(learners);
	}
);
