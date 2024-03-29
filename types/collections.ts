import { collections } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const CollectionSchema = createSelectSchema(collections);
export type Collection = z.infer<typeof CollectionSchema>;

export const CreateCollectionSchema = CollectionSchema.omit({
	id: true,
	teamId: true,
});
export type CreateCollection = z.infer<typeof CreateCollectionSchema>;
