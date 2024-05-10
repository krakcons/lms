"use client";

import { Check, Clipboard } from "lucide-react";
import { useEffect, useState } from "react";

const CopyText = ({ text }: { text: string }) => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			const timeout = setTimeout(() => setCopied(false), 2000);
			return () => clearTimeout(timeout);
		}
	}, [copied]);

	if (copied) {
		return <Check className="h-4 w-4 min-w-4 text-green-500" />;
	}

	return (
		<Clipboard
			className="h-4 w-4 min-w-4 cursor-pointer text-muted-foreground"
			onClick={() => {
				setCopied(true);
				navigator.clipboard.writeText(text);
			}}
		/>
	);
};

export const DNSRow = ({
	type,
	name,
	value,
	ttl,
	priority,
}: {
	type: string;
	name: string;
	value: string;
	ttl: string;
	priority?: number;
}) => {
	return (
		<div className="flex items-center justify-between gap-6 rounded border p-3">
			<div className="w-10">
				<p className="text-sm font-bold">Type</p>
				<p className="mt-2 font-mono text-sm">{type}</p>
			</div>
			<div className="w-52">
				<p className="text-sm font-bold">Name</p>
				<p className="mt-2 font-mono text-sm">{name}</p>
			</div>
			<div className="w-full min-w-0 max-w-96 flex-1 overflow-hidden">
				<p className="text-sm font-bold">Value</p>
				<div className="flex items-center justify-between gap-2">
					<p className="mt-2 truncate font-mono text-sm">{value}</p>
					<CopyText text={value} />
				</div>
			</div>
			{priority && (
				<div>
					<p className="text-sm font-bold">Priority</p>
					<p className="mt-2 font-mono text-sm">
						{priority === 1 ? "" : priority}
					</p>
				</div>
			)}
			<div>
				<p className="w-20 text-sm font-bold">TTL</p>
				<p className="mt-2 font-mono text-sm">{ttl}</p>
			</div>
		</div>
	);
};
