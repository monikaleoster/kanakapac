import postgres from "postgres";

async function reload() {
    const databaseUrl = "postgresql://postgres:s3CEGV1QkA8yLcuv@db.uajvjandccxgmpjwipib.supabase.co:5432/postgres";
    const sql = postgres(databaseUrl);
    try {
        console.log("Sending reload notification to PostgREST...");
        await sql`NOTIFY pgrst, 'reload schema'`;
        console.log("✅ Notification sent.");
    } catch (e) {
        console.error("Failed to notify:", e);
    } finally {
        await sql.end();
    }
}

reload();
