"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash } from "lucide-react";

const DeleteModule = ({ moduleId }: { moduleId: string }) => {
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		mutationFn: client.api.modules[":id"].$delete,
		onSettled: () => {
			router.refresh();
		},
	});

	return (
		<Button
			variant="outline"
			className="flex items-center gap-2"
			onClick={() =>
				mutate({
					param: { id: moduleId },
				})
			}
		>
			{isPending ? (
				<Loader2 size={20} className="animate-spin" />
			) : (
				<Trash size={20} />
			)}
			Delete
		</Button>
	);
};

export default DeleteModule;
