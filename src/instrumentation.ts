export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV !== "production") {
        const { initDatabase } = await import("./lib/init-db");
        await initDatabase();
    }
}
