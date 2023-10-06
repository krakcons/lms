import { appRouter } from "@/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "edge";
export const preferredRegion = "cle1";
export const dynamic = "force-dynamic";

const handler = (req: Request) => {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		router: appRouter,
		req,
		createContext: () => ({}),
	});
};

export { handler as GET, handler as POST };
