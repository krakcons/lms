"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// @ts-ignore
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

const Page = () => {
	return (
		<main className="min-h-screen bg-white">
			<SwaggerUI url="/api/openapi.json" />
		</main>
	);
};

export default Page;
