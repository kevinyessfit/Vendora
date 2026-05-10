import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

export const generateLink = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ error: 'productId is required' });

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Product not found or inactive' });
        }

        // Upsert — one link per vendor per product
        const existing = await prisma.affiliateLink.findUnique({
            where: { vendorId_productId: { vendorId: req.user.id, productId } }
        });
        if (existing) return res.json(existing);

        const code = uuidv4().replace(/-/g, '').slice(0, 12);
        const link = await prisma.affiliateLink.create({
            data: { code, vendorId: req.user.id, productId }
        });
        res.status(201).json(link);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyLinks = async (req, res) => {
    try {
        const links = await prisma.affiliateLink.findMany({
            where: { vendorId: req.user.id },
            include: {
                product: { select: { title: true, price: true, commissionPct: true, imageUrl: true } },
                _count: { select: { clicks: true } },
                earnings: { select: { amount: true, status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const enriched = links.map(link => ({
            ...link,
            totalEarnings: link.earnings.reduce((sum, e) => sum + e.amount, 0),
            pendingEarnings: link.earnings
                .filter(e => e.status === 'PENDING')
                .reduce((sum, e) => sum + e.amount, 0),
        }));

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const trackClick = async (req, res) => {
    try {
        const { code } = req.params;
        const link = await prisma.affiliateLink.findUnique({ where: { code } });
        if (!link) return res.status(404).json({ error: 'Affiliate link not found' });

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        await prisma.click.create({
            data: {
                affiliateLinkId: link.id,
                ip,
                userId: req.user?.id || null,
            }
        });

        // Get the product to redirect to
        const product = await prisma.product.findUnique({ where: { id: link.productId } });
        res.json({ productId: product.id, code: link.code, message: 'Click recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const links = await prisma.affiliateLink.findMany({
            where: { vendorId: req.user.id },
            include: {
                _count: { select: { clicks: true } },
                earnings: true,
                product: { select: { title: true, commissionPct: true, price: true } }
            }
        });

        const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0);
        const totalEarnings = links.flatMap(l => l.earnings).reduce((sum, e) => sum + e.amount, 0);
        const pendingEarnings = links.flatMap(l => l.earnings)
            .filter(e => e.status === 'PENDING')
            .reduce((sum, e) => sum + e.amount, 0);

        res.json({ totalLinks: links.length, totalClicks, totalEarnings, pendingEarnings, links });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
