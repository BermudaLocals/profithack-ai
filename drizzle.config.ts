import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL not set - using placeholder for config");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./server/shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
