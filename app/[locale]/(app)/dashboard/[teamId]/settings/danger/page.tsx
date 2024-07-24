"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { useMutation } from "@tanstack/react-query";

const Page = ({
	params: { teamId },
}: {
	params: {
		teamId: string;
	};
}) => {
	const router = useRouter();
	const deleteMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.teams[":id"].$delete({
				param: { id: teamId },
			});
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			setTimeout(() => {
				router.push("/dashboard");
			}, 3000);
		},
	});

	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h2>Danger</h2>
					<p className="text-muted-foreground">
						Only proceed if you know what you are doing
					</p>
				</div>
			</div>
			<Separator className="my-8" />
			<Button
				variant="destructive"
				onClick={() => {
					deleteMutation.mutate();
				}}
				isPending={deleteMutation.isPending}
			>
				Delete team
			</Button>
		</>
	);
};

export default Page;
