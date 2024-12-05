import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SvixErrorSchema, svix } from "@/server/svix";
import Docs from "./docs.mdx";

const Page = async ({ params }: { params: Promise<{ courseId: string }> }) => {
	const { courseId } = await params;
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
			<Tabs defaultValue="manage">
				<TabsList className="mt-4">
					<TabsTrigger value="manage">Manage</TabsTrigger>
					<TabsTrigger value="docs">Docs</TabsTrigger>
				</TabsList>
				<Separator className="my-8" />
				<TabsContent value="manage">
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
				</TabsContent>
				<TabsContent value="docs" className="flex flex-col gap-8">
					<Docs />
				</TabsContent>
			</Tabs>
		</main>
	);
};

export default Page;
