import { modules } from "@/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const ModuleSchema = createSelectSchema(modules);
export type Module = z.infer<typeof ModuleSchema>;

export const DeleteModuleSchema = ModuleSchema.pick({
	id: true,
});
export type DeleteModule = z.infer<typeof DeleteModuleSchema>;

export const SelectModuleSchema = ModuleSchema.pick({
	id: true,
});
export type SelectModule = z.infer<typeof SelectModuleSchema>;

export const UploadModuleSchema = createInsertSchema(modules);
export type UploadModule = z.infer<typeof UploadModuleSchema>;

export const UpdateModuleSchema = ModuleSchema.pick({
	id: true,
	name: true,
	description: true,
});
export type UpdateModule = z.infer<typeof UpdateModuleSchema>;
