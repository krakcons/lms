import { Separator } from "@/components/ui/separator";
import { SvixErrorSchema, svix } from "@/server/svix";

const Page = async ({
	params: { courseId },
}: {
	params: { courseId: string };
}) => {
	let url = undefined;
	try {
		const dashboard = await svix.authentication.appPortalAccess(
			`app_${courseId}`,
			{}
		);
		url = dashboard.url;
	} catch (e) {
		const se = SvixErrorSchema.safeParse(e);
		if (se.success) {
			if (se.data.body.code === "not_found") {
				await svix.application.create({
					name: `app_${courseId}`,
					uid: `app_${courseId}`,
				});
				const dashboard = await svix.authentication.appPortalAccess(
					`app_${courseId}`,
					{}
				);
				url = dashboard.url;
			}
		}
	}

	return (
		<main>
			<h2>Webhooks</h2>
			<p className="text-muted-foreground">Manage your webhooks</p>
			<Separator className="my-8" />
			<iframe
				src={url}
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
