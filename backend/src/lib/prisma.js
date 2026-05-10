import { PrismaClient } from '@prisma/client';

// Fix DATABASE_URL for serverless environments (Vercel + Supabase)
// Handles: spaces in password, wrong pooler port, missing pgbouncer flag
function fixDatabaseUrl(rawUrl) {
    if (!rawUrl) return rawUrl;
    let url = rawUrl.replace(/ /g, '%20');
    if (url.includes('.pooler.supabase.com') && url.includes(':5432/')) {
        url = url.replace(':5432/', ':6543/');
    }
    if (url.includes('.pooler.supabase.com') && !url.includes('pgbouncer')) {
        url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
    }
    return url;
}

const prisma = new PrismaClient({
    datasources: {
        db: { url: fixDatabaseUrl(process.env.DATABASE_URL) },
    },
});

export default prisma;
