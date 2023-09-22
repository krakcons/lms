import { z } from "zod";

export const BaseItemSchema = z.object({
	identifier: z.string(),
	identifierref: z.string().optional(),
	title: z.string(),
});

export const ItemShema = z.object({
	...BaseItemSchema.shape,
	item: BaseItemSchema.or(BaseItemSchema.array()).optional(),
});

export const OrganizationSchema = z.object({
	identifier: z.string(),
	title: z.string(),
	item: ItemShema.or(ItemShema.array()),
});

export const FileSchema = z.object({
	href: z.string(),
});

export const ResourceSchema = z.object({
	identifier: z.string(),
	href: z.string().optional(),
	file: FileSchema.or(FileSchema.array()),
});
export type Resource = z.infer<typeof ResourceSchema>;

// Add more versions as needed
export const ScormVersionSchema = z.literal(1.2, {
	errorMap: () => {
		return {
			code: "invalid_type",
			message: "Invalid SCORM version. Only 1.2 is supported.",
		};
	},
});

export const IMSManifestSchema = z.object({
	manifest: z.object({
		metadata: z.object({
			schema: z.string(),
			schemaversion: ScormVersionSchema,
		}),
		organizations: z.object({
			default: z.string().optional(),
			organization: OrganizationSchema.or(OrganizationSchema.array()),
		}),
		resources: z.object({
			resource: ResourceSchema.or(ResourceSchema.array()),
		}),
	}),
});
