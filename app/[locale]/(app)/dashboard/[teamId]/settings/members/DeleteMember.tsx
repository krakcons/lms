"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { UserMinus } from "lucide-react";

const DeleteMember = ({
	teamId,
	userId,
}: {
	teamId: string;
	userId: string;
}) => {
	const router = useRouter();
	const deleteMember = useMutation({
		mutationFn: async () => {
			const res = await client.api.teams[":id"].member.$delete({
				param: { id: teamId },
				json: {
					userId,
				},
			});
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			router.refresh();
		},
	});

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={() => {
				deleteMember.mutate();
			}}
		>
			<UserMinus size={20} />
		</Button>
	);
};

export default DeleteMember;
