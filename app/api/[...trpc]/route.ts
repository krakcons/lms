import { createOpenApiFetchHandler } from "./handler";

import { appRouter } from "@/server";

const handler = (req: Request) => {
	// Handle incoming OpenAPI requests
	return createOpenApiFetchHandler({
		endpoint: "/api",
		router: appRouter,
		createContext: () => ({}),
		req,
	});
};

export {
	handler as DELETE,
	handler as GET,
	handler as HEAD,
	handler as OPTIONS,
	handler as PATCH,
	handler as POST,
	handler as PUT,
};
