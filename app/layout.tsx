import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			{children}
			<Analytics />
			<AxiomWebVitals />
		</>
	);
};

export default RootLayout;
