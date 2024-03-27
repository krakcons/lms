import { teams } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const validDomainSchema = z
	.string()
	.regex(
		new RegExp(
			/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
		),
		"Invalid domain format, use format (example.com)"
	);

export const TeamSchema = createSelectSchema(teams, {
	customDomain: validDomainSchema,
});
export type Team = z.infer<typeof TeamSchema>;
