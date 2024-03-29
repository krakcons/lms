"use client";

import {
	InviteForm,
	LearnersInviteForm,
} from "@/components/learner/LearnersInviteForm";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const CollectionLearnerInvite = ({
	collectionId,
}: {
	collectionId: string;
}) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: client.api.collections[":id"].learners.$post,
		onSuccess: () => {
			router.refresh();
			toast("Successfully Invited", {
				description: `User has been sent an invitation to join this course.`,
			});
			setOpen(false);
		},
		onError: (err) => {
			toast.error("Something went wrong!", {
				description: err.message,
			});
		},
	});

	const onSubmit = async (input: InviteForm) => {
		mutate({
			param: {
				id: collectionId,
			},
			json: input.learners,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus size={18} />
					Invite Learners
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Invite learners</DialogTitle>
					<DialogDescription>
						Enter an email and name below.
					</DialogDescription>
				</DialogHeader>
				<LearnersInviteForm isPending={isPending} onSubmit={onSubmit} />
			</DialogContent>
		</Dialog>
	);
};
