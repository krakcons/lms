import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./Providers";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Krak LCDS",
	description: "LDCS for modern times, cheap and easy to use",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.className} flex min-h-screen flex-col`}>
				<ClerkProvider
					appearance={{
						variables: {
							colorPrimary: "hsl(220.9 39.3% 11%)",
							colorDanger: "hsl(0 84.2% 60.2%)",
							colorBackground: "hsl(0 0% 100%)",
							colorText: "hsl(224 71.4% 4.1%)",
							colorTextOnPrimaryBackground: "hsl(210 20% 98%)",
							borderRadius: "0.5rem",
						},
					}}
				>
					<Providers>
						{children}
						<Toaster />
					</Providers>
				</ClerkProvider>
			</body>
		</html>
	);
};

export default RootLayout;
