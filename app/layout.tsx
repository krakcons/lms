import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Krak LMS",
	description: "LMS for modern times, cheap and easy to use",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
			}}
		>
			<html lang="en" className="bg-elevation-1 text-light-gray">
				<body className={`${inter.className} min-h-screen flex flex-col`}>{children}</body>
			</html>
		</ClerkProvider>
	);
};

export default RootLayout;
