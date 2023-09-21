"use client";

import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";

type Props = {
	token: string;
};

const CopyKey = ({ token }: Props) => {
	return (
		<div className="flex items-center justify-between">
			<p>
				{token
					? "**************" +
					  token.slice(token.length - 5, token.length)
					: "No API key generated yet"}
			</p>
			<Button
				size="icon"
				variant="outline"
				onClick={async () => {
					await navigator.clipboard.writeText(token);
				}}
			>
				<ClipboardCopy />
			</Button>
		</div>
	);
};

export default CopyKey;
