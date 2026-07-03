import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Admin credentials MUST come from env — never ship a hardcoded/guessable password.
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        console.warn('⚠️  Skipping admin: set ADMIN_EMAIL and ADMIN_PASSWORD to create the admin account.');
    } else if (adminPassword.length < 12) {
        console.warn('⚠️  Skipping admin: ADMIN_PASSWORD must be at least 12 characters.');
    } else {
        const adminPass = await bcrypt.hash(adminPassword, 10);
        await prisma.user.upsert({
            where: { email: adminEmail },
            update: { password: adminPass, role: 'ADMIN' },
            create: { name: 'Admin', email: adminEmail, password: adminPass, role: 'ADMIN' },
        });
        console.log(`✅ Admin ready: ${adminEmail}`);
    }

    // Demo fixtures (test merchant/vendor + sample products) — opt-in only.
    // Never seed weak-password demo accounts into production.
    if (process.env.SEED_DEMO !== 'true') {
        console.log('ℹ️  Skipping demo data (set SEED_DEMO=true for local test accounts).');
        return;
    }

    const merchantPass = await bcrypt.hash('merchant123', 10);
    const merchant = await prisma.user.upsert({
        where: { email: 'merchant@vendora.com' },
        update: {},
        create: { name: 'Test Merchant', email: 'merchant@vendora.com', password: merchantPass, role: 'MERCHANT' }
    });

    const vendorPass = await bcrypt.hash('vendor123', 10);
    await prisma.user.upsert({
        where: { email: 'vendor@vendora.com' },
        update: {},
        create: { name: 'Test Vendor', email: 'vendor@vendora.com', password: vendorPass, role: 'VENDOR' }
    });

    const products = await Promise.all([
        prisma.product.upsert({
            where: { id: 'seed-product-1' },
            update: {},
            create: {
                id: 'seed-product-1',
                title: 'Premium Wireless Headphones',
                description: 'High-fidelity audio with 40h battery life and active noise cancellation.',
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                price: 149.99,
                commissionPct: 15,
                merchantId: merchant.id,
            }
        }),
        prisma.product.upsert({
            where: { id: 'seed-product-2' },
            update: {},
            create: {
                id: 'seed-product-2',
                title: 'Smart Fitness Tracker',
                description: 'Track your health 24/7 with heart rate, sleep, and GPS monitoring.',
                imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e97fd29?w=400',
                price: 79.99,
                commissionPct: 12,
                merchantId: merchant.id,
            }
        }),
    ]);

    console.log(`✅ Demo seeded: merchant, vendor + ${products.length} products`);
    console.log('📧 merchant@vendora.com / merchant123');
    console.log('📧 vendor@vendora.com / vendor123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
