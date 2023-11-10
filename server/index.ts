import { courseRouter } from "./routers/course";
import { learnerRouter } from "./routers/learner";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
	course: courseRouter,
	learner: learnerRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
