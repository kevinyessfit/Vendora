import { PrismaClient } from '@prisma/client';

// Converts Supabase pooler URL → direct connection URL
// Pooler: postgres.REF:PASS@aws-X.pooler.supabase.com:PORT/db  (can fail when project paused)
// Direct: postgres:PASS@db.REF.supabase.co:5432/db             (more reliable)
function fixDatabaseUrl(rawUrl) {
    if (!rawUrl) return rawUrl;

    // Encode spaces in password
    let url = rawUrl.replace(/ /g, '%20');

    // Convert pooler URL to direct connection
    const poolerMatch = url.match(
        /^(postgresql|postgres):\/\/postgres\.([a-zA-Z0-9]+):([^@]+)@[^/]*pooler\.supabase\.com[^/]*\/(.+)$/
    );
    if (poolerMatch) {
        const [, scheme, projectRef, password, dbName] = poolerMatch;
        return `${scheme}://postgres:${password}@db.${projectRef}.supabase.co:5432/${dbName}`;
    }

    return url;
}

const prisma = new PrismaClient({
    datasources: {
        db: { url: fixDatabaseUrl(process.env.DATABASE_URL) },
    },
});

export default prisma;
