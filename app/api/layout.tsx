import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Krak LCDS Docs",
	description: "Documentation for Krak LCDS",
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
	return (
		<html suppressHydrationWarning>
			<body className={`${inter.className} flex min-h-screen flex-col`}>
				{children}
			</body>
		</html>
	);
};

export default Layout;
