import postgres from "postgres";
import fs from "fs";
import path from "path";

export async function initDatabase() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl || databaseUrl.includes("[YOUR-PASSWORD]")) {
        console.warn("⚠️ DATABASE_URL is not configured properly. Skipping auto-initialization.");
        return;
    }

    const sql = postgres(databaseUrl);

    try {
        // Check if the events table exists as a proxy for schema initialization
        const tables = await sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' AND tablename = 'events'
    `;

        if (tables.length === 0) {
            console.log("🚀 Initializing database schema...");

            const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
            const seedPath = path.join(process.cwd(), "supabase", "seed.sql");

            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, "utf8");
                await sql.unsafe(schema);
                console.log("✅ Schema created.");
            }

            if (fs.existsSync(seedPath)) {
                const seed = fs.readFileSync(seedPath, "utf8");
                await sql.unsafe(seed);
                console.log("✅ Seed data populated.");
            }
        } else {
            console.log("ℹ️ Database schema already exists.");
        }

        // Always notify PostgREST to reload schema cache to avoid stale cache errors like PGRST205
        await sql`NOTIFY pgrst, 'reload schema'`;
        console.log("📡 Notified Supabase to reload schema cache.");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
    } finally {
        await sql.end();
    }
}
