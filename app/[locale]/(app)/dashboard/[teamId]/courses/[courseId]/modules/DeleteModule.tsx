"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";

const deleteModuleFn = client.api.modules[":id"].$delete;

const DeleteModule = ({ moduleId }: { moduleId: string }) => {
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		mutationFn: async (input: InferRequestType<typeof deleteModuleFn>) => {
			const res = await deleteModuleFn(input);
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
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
