import { Toaster } from "@/components/ui/toaster";
import { localization } from "@/lib/clerk";
import { locales } from "@/lib/locale";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AxiomWebVitals } from "next-axiom";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import Providers from "./Providers";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Krak LCDS",
	description: "LDCS for modern times, cheap and easy to use",
};

const RootLayout = async ({
	children,
	params: { locale },
}: {
	children: React.ReactNode;
	params: { locale: string };
}) => {
	if (!locales.includes(locale)) notFound();

	return (
		<ClerkProvider localization={localization}>
			<html lang={locale} suppressHydrationWarning>
				<AxiomWebVitals />
				<body
					className={`${inter.className} flex min-h-screen flex-col`}
				>
					<Providers>
						{children}
						<Toaster />
					</Providers>
				</body>
			</html>
		</ClerkProvider>
	);
};

export default RootLayout;
