"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";

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
			onClick={() =>
				mutate({
					param: { id: moduleId },
				})
			}
			isPending={isPending}
		>
			Delete
		</Button>
	);
};

export default DeleteModule;
