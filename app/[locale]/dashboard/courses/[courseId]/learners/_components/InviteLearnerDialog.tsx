"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const InviteLearnerForm = dynamic(() => import("./InviteLearnerForm"), {});

const InviteLearnerDialog = ({ courseId }: { courseId: string }) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon">
									<UserPlus />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>Invite Learner</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</DialogTrigger>
			<InviteLearnerForm
				close={() => setOpen(false)}
				courseId={courseId}
			/>
		</Dialog>
	);
};

export default InviteLearnerDialog;
