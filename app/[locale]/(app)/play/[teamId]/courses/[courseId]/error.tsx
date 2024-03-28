"use client";
import { Button } from "@/components/ui/button";

// Error components must be Client Components

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
			<h2>Something went wrong!</h2>
			<p className="px-4 text-center">{error.message}</p>
			<Button
				onClick={
					// Attempt to recover by trying to re-render the segment
					() => reset()
				}
			>
				Try again
			</Button>
		</div>
	);
}
