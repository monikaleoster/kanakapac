import postgres from "postgres";

async function check() {
    const databaseUrl = "postgresql://postgres:s3CEGV1QkA8yLcuv@db.uajvjandccxgmpjwipib.supabase.co:5432/postgres";
    const sql = postgres(databaseUrl);
    try {
        const tables = await sql`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        console.log("Tables found:", tables);
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await sql.end();
    }
}

check();
