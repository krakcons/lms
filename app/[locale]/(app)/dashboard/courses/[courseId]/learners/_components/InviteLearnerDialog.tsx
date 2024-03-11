"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const InviteLearnerForm = dynamic(() => import("./InviteLearnerForm"), {});

const InviteLearnerDialog = ({ courseId }: { courseId: string }) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<UserPlus size={18} />
					Invite Learner
				</Button>
			</DialogTrigger>
			<InviteLearnerForm
				close={() => setOpen(false)}
				courseId={courseId}
			/>
		</Dialog>
	);
};

export default InviteLearnerDialog;
