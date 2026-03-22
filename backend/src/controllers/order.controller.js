import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
    try {
        const { customerName, customerPhone, customerAddress, productId, affiliateCode } = req.body;

        if (!customerName || !customerPhone || !customerAddress || !productId) {
            return res.status(400).json({ error: 'Missing required order details' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Product not found or inactive' });
        }

        let affiliateLinkId = null;
        let vendorCommission = 0;
        let platformCommission = product.price * (product.platformCommission / 100);

        // Default Merchant keeps everything minus the platform fee
        let merchantEarnings = product.price - platformCommission;

        // If an affiliate code is provided, look up the link
        if (affiliateCode) {
            const link = await prisma.affiliateLink.findUnique({ where: { code: affiliateCode } });
            if (link) {
                affiliateLinkId = link.id;
                vendorCommission = product.price * (product.commissionPct / 100);
                // Subtract vendor commission from merchant earnings
                merchantEarnings -= vendorCommission;
            }
        }

        // Create the order and the earning (if applicable) in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    customerName,
                    customerPhone,
                    customerAddress,
                    productId: product.id,
                    amount: product.price,
                    vendorCommission,
                    platformCommission,
                    merchantEarnings,
                    affiliateLinkId
                }
            });

            if (affiliateLinkId && vendorCommission > 0) {
                await tx.earning.create({
                    data: {
                        amount: vendorCommission,
                        affiliateLinkId,
                        status: 'PENDING',
                        orderId: order.id
                    }
                });
            }

            return order;
        });

        res.status(201).json({ message: 'Order placed successfully', orderId: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMerchantOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                product: {
                    merchantId: req.user.id
                }
            },
            include: {
                product: { select: { title: true } },
                affiliateLink: { include: { vendor: { select: { name: true, email: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                product: { select: { title: true, merchant: { select: { name: true } } } },
                affiliateLink: { include: { vendor: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getVendorOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                affiliateLink: {
                    vendorId: req.user.id
                }
            },
            include: {
                product: { select: { title: true, imageUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { product: true }
        });

        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Ensure user is authorized (Admin or the Merchant)
        if (req.user.role !== 'ADMIN' && order.product.merchantId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this order' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id },
                data: { status }
            });

            if (order.affiliateLinkId) {
                // Determine what to do with the earning based on new status
                let earningStatus;
                if (status === 'COMPLETED') earningStatus = 'APPROVED';
                else if (status === 'CANCELLED') earningStatus = 'REJECTED';
                
                if (earningStatus) {
                    await tx.earning.updateMany({
                        where: { orderId: order.id },
                        data: { status: earningStatus }
                    });
                }
            }

            return updatedOrder;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
