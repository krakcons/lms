"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
	token: string;
};

const CopyKey = ({ token }: Props) => {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		await navigator.clipboard.writeText(token);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	return (
		<div className="flex items-center justify-between">
			<p>
				{token
					? "**************" +
					  token.slice(token.length - 5, token.length)
					: "No API key generated yet"}
			</p>
			<Button variant="outline" onClick={copy}>
				{copied ? "Copied!" : "Copy"}
			</Button>
		</div>
	);
};

export default CopyKey;
