"use client";

import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { useLogger } from "next-axiom";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
	const logger = useLogger();
	const queryClient = new QueryClient({
		queryCache: new QueryCache({
			onError: (error) => {
				logger.error(error.message, { error });
			},
		}),
		mutationCache: new MutationCache({
			onError: (error) => {
				logger.error(error.message, { error });
				toast.error("Something went wrong", {
					description: error.message,
				});
			},
		}),
	});

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				{children}
			</ThemeProvider>
		</QueryClientProvider>
	);
};

export default Providers;
