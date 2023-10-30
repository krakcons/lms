import { Separator } from "@/components/ui/separator";
import { svix } from "@/server/svix";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	const dashboard = await svix.authentication.appPortalAccess(
		`app_${courseId}`,
		{}
	);

	return (
		<main>
			<h2>Webhooks</h2>
			<p className="text-muted-foreground">Manage your webhooks</p>
			<Separator className="my-8" />
			<iframe
				src={dashboard.url}
				style={{
					width: "100%",
					height: "600px",
					border: "none",
					borderRadius: "8px",
				}}
				allow="clipboard-write"
				loading="lazy"
			></iframe>
		</main>
	);
};

export default Page;
