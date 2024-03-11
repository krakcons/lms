"use client"; // Error components must be Client Components

import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { useEffect } from "react";

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error.message);
	}, [error]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-8">
			<h2>{error.message ?? "Uh Oh. Something went wrong!"}</h2>
			<p className="text-muted-foreground">
				Please try again or return to the dashboard.
			</p>
			<div className="flex gap-4">
				<Link href="/dashboard" className={buttonVariants()}>
					Back to dashboard
				</Link>
				<Button onClick={() => reset()} variant="outline">
					Try again
				</Button>
			</div>
		</div>
	);
};

export default Error;
