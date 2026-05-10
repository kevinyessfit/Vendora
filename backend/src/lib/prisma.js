import { PrismaClient } from '@prisma/client';

// Fix DATABASE_URL for Vercel + Supabase pooler
// - Encode spaces in password
// - Use port 6543 (transaction mode) instead of 5432
// - Add pgbouncer=true required by Prisma
function fixDatabaseUrl(rawUrl) {
    if (!rawUrl) return rawUrl;
    let url = rawUrl.replace(/ /g, '%20');
    if (url.includes('.pooler.supabase.com')) {
        url = url.replace(/:5432\//, ':6543/');
        if (!url.includes('pgbouncer')) {
            url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
        }
    }
    return url;
}

const prisma = new PrismaClient({
    datasources: {
        db: { url: fixDatabaseUrl(process.env.DATABASE_URL) },
    },
});

export default prisma;
