"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { env } from "@/env.mjs";
import { useState } from "react";

type Props = {
	courseId: string;
};

const PublicLinkButton = ({ courseId }: Props) => {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		await navigator.clipboard.writeText(
			`${env.NEXT_PUBLIC_SITE_URL}/play/${courseId}/public`
		);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	return (
		<div className="flex w-full flex-col gap-1">
			<p>Share public link</p>
			<div
				className={buttonVariants({
					variant: "secondary",
					className: "flex-1 justify-between gap-3",
				})}
			>
				<p className="truncate text-sm text-muted-foreground">
					{env.NEXT_PUBLIC_SITE_URL}/play/{courseId}/public
				</p>
				<Button variant="outline" size={"sm"} onClick={copy}>
					{copied ? "Copied!" : "Copy"}
				</Button>
			</div>
		</div>
	);
};

export default PublicLinkButton;
