import pg from "pg";

const { Pool } = pg;

let pool;

export function getOrdersPool() {
  if (!pool) {
    const connectionString = process.env.SUPABASE_URI;

    if (!connectionString) {
      throw new Error("Missing SUPABASE_URI environment variable");
    }

    pool = new Pool({
      connectionString,

      // Keep the connection count low for Lambda.
      max: Number(process.env.ORDERS_PG_POOL_MAX || 1),
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (error) => {
      console.error("Unexpected idle PostgreSQL client error", {
        message: error.message,
      });
    });
  }

  return pool;
}

export async function closeOrdersPool() {
  if (pool) {
    const currentPool = pool;
    pool = undefined;
    await currentPool.end();
  }
}
