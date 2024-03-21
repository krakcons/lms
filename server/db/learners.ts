import { getInitialScormData } from "@/lib/scorm";
import { inviteLearnerAction } from "@/server/actions/learner";
import { db } from "@/server/db/db";
import { learners } from "@/server/db/schema";
import {
	CreateLearner,
	ExtendLearner,
	SelectLearner,
	SelectLearners,
	UpdateLearner,
} from "@/types/learner";
import { and, eq } from "drizzle-orm";
import { LCDSError } from "../errors";
import { svix } from "../svix";
import { getCourse, getCourseUnauthed } from "./courses";

export const createLearner = async ({
	courseId,
	email,
	sendEmail,
	id,
}: CreateLearner) => {
	const course = await getCourseUnauthed({ id: courseId });

	// Create a new learner
	const newLearner = {
		id: id ?? crypto.randomUUID(),
		courseId: course.id,
		email: email ? email : null,
		data: getInitialScormData(course.version),
		version: course.version,
	};

	if (sendEmail && email) {
		await inviteLearnerAction(newLearner.id, email, course);
	}

	await db.insert(learners).values(newLearner).onConflictDoNothing();

	return ExtendLearner.parse(newLearner);
};

export const getLearner = async ({ id, courseId }: SelectLearner) => {
	await getCourseUnauthed({ id: courseId });

	const learner = await db.query.learners.findFirst({
		where: and(eq(learners.id, id), eq(learners.courseId, courseId)),
	});

	if (!learner) {
		throw new LCDSError({
			code: "NOT_FOUND",
			message: "Learner not found.",
		});
	}

	return ExtendLearner.parse(learner);
};

export const getLearners = async (
	{ courseId }: SelectLearners,
	userId: string
) => {
	await getCourse({ id: courseId }, userId);

	const learnerList = await db.query.learners.findMany({
		where: eq(learners.courseId, courseId),
	});

	return ExtendLearner.array().parse(learnerList);
};

export const updateLearner = async ({ id, courseId, data }: UpdateLearner) => {
	const learner = await db.query.learners.findFirst({
		where: and(eq(learners.id, id), eq(learners.courseId, courseId)),
	});

	if (!learner) {
		return new Response("Learner not found", { status: 404 });
	}

	await db
		.update(learners)
		.set({ data })
		.where(and(eq(learners.courseId, courseId), eq(learners.id, id)));

	const newLearner = ExtendLearner.parse({
		...learner,
		data,
	});

	await svix.message.create(`app_${courseId}`, {
		eventType: "learner.update",
		payload: newLearner,
	});

	return newLearner;
};

export const deleteLearner = async ({ id, courseId }: SelectLearner) => {
	await getLearner({ id, courseId });

	await db
		.delete(learners)
		.where(and(eq(learners.id, id), eq(learners.courseId, courseId)));
};
