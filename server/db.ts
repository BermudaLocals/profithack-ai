import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL not set - using mock database mode");
}

const connectionString = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";

let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = new Pool({ connectionString });
  db = drizzle(pool, { schema });
} catch (error) {
  console.error("Failed to initialize database pool:", error);
  pool = new Pool({ connectionString: "postgresql://mock:mock@localhost:5432/mock" });
  db = drizzle(pool, { schema });
}

export async function testConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️ No DATABASE_URL - skipping connection test");
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    throw error;
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error?.code === "57P01" || error?.message?.includes("terminating connection")) {
        console.log(`Database retry ${i + 1}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

export { pool, db };
export default db;
