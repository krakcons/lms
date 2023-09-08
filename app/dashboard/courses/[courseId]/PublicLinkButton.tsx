"use client";

import { Button } from "@/components/ui/Button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import { toast } from "@/components/ui/useToast";
import { env } from "@/env.mjs";
import { Link } from "lucide-react";

type Props = {
	courseId: string;
};

const PublicLinkButton = ({ courseId }: Props) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="mr-3"
						onClick={() => {
							navigator.clipboard.writeText(
								`${env.NEXT_PUBLIC_SERVER_URL}/courses/${courseId}/public`
							);
							toast({
								title: "Copied public link to clipboard",
								description:
									"You can now share this link with anyone.",
							});
						}}
					>
						<Link size={22} />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Copy Public Link</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default PublicLinkButton;
