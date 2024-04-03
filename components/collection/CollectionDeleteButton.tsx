"use client";

import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { Button } from "../ui/button";

export const CollectionDeleteButton = ({
	collectionId,
}: {
	collectionId: string;
}) => {
	const router = useRouter();
	const { mutate } = useMutation({
		mutationFn: client.api.collections[":id"].$delete,
		onSuccess: async () => {
			router.refresh();
		},
	});

	return (
		<Button
			variant="outline"
			onClick={() => {
				mutate({
					param: { id: collectionId },
				});
			}}
			size="icon"
		>
			<Trash size={18} />
		</Button>
	);
};
