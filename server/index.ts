import { courseRouter } from "./routers/course";
import { learnerRouter } from "./routers/learner";
import { router } from "./trpc";

export const appRouter = router({
	course: courseRouter,
	learner: learnerRouter,
});

export type AppRouter = typeof appRouter;
