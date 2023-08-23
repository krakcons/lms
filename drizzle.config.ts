import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
	dbCredentials: {
		connectionString: process.env.DATABASE_URL!,
	},
	schema: "./lib/db/schema.ts",
	out: "./drizzle",
	driver: "mysql2",
} satisfies Config;
