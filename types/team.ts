import { teams } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const TeamSchema = createSelectSchema(teams);
export type Team = z.infer<typeof TeamSchema>;
