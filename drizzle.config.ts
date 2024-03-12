import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
	dbCredentials: {
		connectionString: process.env.DATABASE_URL!,
	},
	schema: "./server/db/schema.ts",
	out: "./drizzle",
	driver: "pg",
} satisfies Config;
