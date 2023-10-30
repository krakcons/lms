import { Toaster } from "@/components/ui/toaster";
import { defaultTheme, localization } from "@/lib/clerk";
import { locales } from "@/lib/locale";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AxiomWebVitals } from "next-axiom";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { TrpcProvider } from "./_components/TrpcProvider";
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
		<html lang={locale} suppressHydrationWarning>
			<AxiomWebVitals />
			<body className={`${inter.className} flex min-h-screen flex-col`}>
				<ClerkProvider
					localization={localization}
					appearance={defaultTheme}
				>
					<TrpcProvider>
						{children}
						<Toaster />
					</TrpcProvider>
				</ClerkProvider>
			</body>
		</html>
	);
};

export default RootLayout;
