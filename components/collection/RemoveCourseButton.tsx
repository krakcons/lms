"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Minus } from "lucide-react";

const RemoveCourseButton = ({
	courseId,
	collectionId,
}: {
	courseId: string;
	collectionId: string;
}) => {
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		mutationFn: client.api.collections[":id"].courses[":courseId"].$delete,
		onSuccess: async () => {
			router.refresh();
		},
	});

	return (
		<Button
			variant="outline"
			onClick={() => {
				mutate({
					param: { id: collectionId, courseId },
				});
			}}
			size="icon"
			className="absolute right-0 top-0"
		>
			{isPending ? (
				<Loader2 size={20} className="animate-spin" />
			) : (
				<Minus size={24} />
			)}
		</Button>
	);
};

export default RemoveCourseButton;
