import prisma from '../lib/prisma.js';

export const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
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

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                merchant: { select: { id: true, name: true, email: true } },
                _count: { select: { affiliateLinks: true } }
            }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { merchantId: req.user.id },
            include: {
                _count: { select: { affiliateLinks: true, } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, commissionPct } = req.body;
        // The default fallback or explicitly passed URL string.
        let imageUrl = req.body.imageUrl || null;

        if (req.file) {
            // Cloudinary returns the full URL in req.file.path
            imageUrl = req.file.path;
        }

        if (!title || !description || !price) {
            return res.status(400).json({ error: 'Title, description, and price are required' });
        }

        const product = await prisma.product.create({
            data: {
                title,
                description,
                imageUrl,
                price: parseFloat(price),
                commissionPct: parseFloat(commissionPct || 10),
                merchantId: req.user.id,
            }
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.merchantId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { title, description, price, commissionPct, imageUrl: bodyImageUrl } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (commissionPct !== undefined) updateData.commissionPct = parseFloat(commissionPct);
        if (req.file) {
            updateData.imageUrl = req.file.path;
        } else if (bodyImageUrl !== undefined) {
            updateData.imageUrl = bodyImageUrl;
        }

        const updated = await prisma.product.update({
            where: { id },
            data: updateData,
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.merchantId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
