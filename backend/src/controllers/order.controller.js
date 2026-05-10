import { PrismaClient } from '@prisma/client';
import {
    sendNewOrderEmailToMerchant,
    sendOrderConfirmationToCustomer,
    sendCommissionEarnedToVendor,
    sendOrderStatusUpdateToCustomer,
} from '../services/email.service.js';

const prisma = new PrismaClient();

const VALID_PAYMENT_METHODS = ['COD', 'MOBILE_MONEY', 'BANK_TRANSFER'];

export const createOrder = async (req, res) => {
    try {
        const { customerName, customerPhone, customerAddress, customerEmail, productId, affiliateCode, paymentMethod = 'COD' } = req.body;

        if (!customerName || !customerPhone || !customerAddress || !productId) {
            return res.status(400).json({ error: 'Missing required order details' });
        }
        if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { merchant: { select: { id: true, name: true, email: true } } },
        });
        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Product not found or inactive' });
        }

        let affiliateLinkId = null;
        let affiliateVendor = null;
        let vendorCommission = 0;
        let platformCommission = product.price * (product.platformCommission / 100);
        let merchantEarnings = product.price - platformCommission;

        if (affiliateCode) {
            const link = await prisma.affiliateLink.findUnique({
                where: { code: affiliateCode },
                include: { vendor: { select: { id: true, name: true, email: true } } },
            });
            if (link) {
                affiliateLinkId = link.id;
                affiliateVendor = link.vendor;
                vendorCommission = product.price * (product.commissionPct / 100);
                merchantEarnings -= vendorCommission;
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    customerName,
                    customerPhone,
                    customerAddress,
                    customerEmail: customerEmail || null,
                    productId: product.id,
                    amount: product.price,
                    vendorCommission,
                    platformCommission,
                    merchantEarnings,
                    paymentMethod,
                    affiliateLinkId,
                }
            });

            if (affiliateLinkId && vendorCommission > 0) {
                await tx.earning.create({
                    data: { amount: vendorCommission, affiliateLinkId, status: 'PENDING', orderId: order.id }
                });
            }

            return order;
        });

        // Fire emails in background (non-blocking)
        sendNewOrderEmailToMerchant({ merchant: product.merchant, order: result, product }).catch(() => {});
        sendOrderConfirmationToCustomer({ customerEmail, customerName, order: result, product }).catch(() => {});
        if (affiliateVendor && vendorCommission > 0) {
            sendCommissionEarnedToVendor({ vendor: affiliateVendor, product, amount: vendorCommission }).catch(() => {});
        }

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
            include: { product: { include: { merchant: { select: { id: true } } } } }
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

        // Notify customer of status change
        if (order.customerEmail) {
            sendOrderStatusUpdateToCustomer({
                customerEmail: order.customerEmail,
                customerName: order.customerName,
                order: result,
                product: order.product,
            }).catch(() => {});
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
