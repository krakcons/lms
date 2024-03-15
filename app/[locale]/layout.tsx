import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import Providers from "./Providers";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Krak LCDS",
	description: "LDCS for modern times, cheap and easy to use",
};

export const generateStaticParams = () => {
	return [{ locale: "en" }, { locale: "fr" }];
};

const RootLayout = async ({
	children,
	params: { locale },
}: {
	children: React.ReactNode;
	params: { locale: string };
}) => {
	unstable_setRequestLocale(locale);

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${inter.className} flex min-h-screen flex-col`}>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
