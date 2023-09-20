import { courseRouter } from "./routers/course";
import { learnerRouter } from "./routers/learner";
import { router } from "./trpc";

export const appRouter = router({
	learner: learnerRouter,
	course: courseRouter,
});

export type AppRouter = typeof appRouter;
