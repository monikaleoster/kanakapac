import postgres from "postgres";
import fs from "fs";
import path from "path";

export async function initDatabase() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl || databaseUrl.includes("[YOUR-PASSWORD]")) {
        console.warn("⚠️ DATABASE_URL is not configured. Skipping database initialization.");
        return;
    }

    const sql = postgres(databaseUrl);

    try {
        // Apply all migration files in sorted order (idempotent — safe to re-run)
        const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir)
                .filter(f => f.endsWith(".sql"))
                .sort();

            for (const file of files) {
                const filePath = path.join(migrationsDir, file);
                const migration = fs.readFileSync(filePath, "utf8");
                await sql.unsafe(migration);
                console.log(`✅ Applied migration: ${file}`);
            }
        }

        // Apply seed data if the events table is empty
        const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM events`;
        if (count === 0) {
            const seedPath = path.join(process.cwd(), "supabase", "seed.sql");
            if (fs.existsSync(seedPath)) {
                const seed = fs.readFileSync(seedPath, "utf8");
                await sql.unsafe(seed);
                console.log("✅ Seed data populated.");
            }
        }

        // Reload PostgREST schema cache so new columns are visible immediately
        await sql`NOTIFY pgrst, 'reload schema'`;
        console.log("📡 PostgREST schema cache reloaded.");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
    } finally {
        await sql.end();
    }
}
