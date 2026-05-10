import prisma from '../lib/prisma.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, email: true, role: true, createdAt: true,
                _count: { select: { products: true, affiliateLinks: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPlatformStats = async (req, res) => {
    try {
        const [
            users, merchants, vendors,
            products, links, clicks,
            totalOrders, revenue, platformRevenue, commissions,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'MERCHANT' } }),
            prisma.user.count({ where: { role: 'VENDOR' } }),
            prisma.product.count(),
            prisma.affiliateLink.count(),
            prisma.click.count(),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { amount: true } }),
            prisma.order.aggregate({ _sum: { platformCommission: true } }),
            prisma.earning.aggregate({ _sum: { amount: true } }),
        ]);
        res.json({
            totalUsers: users, merchants, vendors,
            totalProducts: products, totalLinks: links, totalClicks: clicks,
            totalOrders,
            totalRevenue: revenue._sum.amount || 0,
            platformRevenue: platformRevenue._sum.platformCommission || 0,
            totalCommissions: commissions._sum.amount || 0,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                merchant: { select: { id: true, name: true, email: true } },
                _count: { select: { affiliateLinks: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const updated = await prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
