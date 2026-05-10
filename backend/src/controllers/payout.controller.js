import { PrismaClient } from '@prisma/client';
import { sendPayoutRequestNotification } from '../services/email.service.js';

const prisma = new PrismaClient();

// VENDOR: get own earnings summary + payout requests
export const getMyEarnings = async (req, res) => {
    try {
        const [earnings, payoutRequests] = await Promise.all([
            prisma.earning.findMany({
                where: { affiliateLink: { vendorId: req.user.id } },
                include: {
                    affiliateLink: { include: { product: { select: { title: true } } } },
                    order: { select: { customerName: true, createdAt: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.payoutRequest.findMany({
                where: { vendorId: req.user.id },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        const approved = earnings.filter(e => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0);
        const paid = earnings.filter(e => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
        const pending = earnings.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);
        const pendingPayoutAmount = payoutRequests
            .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
            .reduce((s, p) => s + p.amount, 0);

        res.json({
            summary: { approved, paid, pending, availableForPayout: approved - pendingPayoutAmount },
            earnings,
            payoutRequests,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// VENDOR: submit a payout request
export const requestPayout = async (req, res) => {
    try {
        const { method, details, amount } = req.body;
        if (!method || !details || !amount) {
            return res.status(400).json({ error: 'method, details and amount are required' });
        }

        const earnings = await prisma.earning.findMany({
            where: { affiliateLink: { vendorId: req.user.id }, status: 'APPROVED' },
        });
        const availableBalance = earnings.reduce((s, e) => s + e.amount, 0);

        const existingPending = await prisma.payoutRequest.aggregate({
            where: { vendorId: req.user.id, status: { in: ['PENDING', 'PROCESSING'] } },
            _sum: { amount: true },
        });
        const reserved = existingPending._sum.amount || 0;
        const actualAvailable = availableBalance - reserved;

        if (parseFloat(amount) > actualAvailable) {
            return res.status(400).json({
                error: `Insufficient balance. Available: $${actualAvailable.toFixed(2)}`,
            });
        }

        const request = await prisma.payoutRequest.create({
            data: { vendorId: req.user.id, amount: parseFloat(amount), method, details },
        });

        sendPayoutRequestNotification({ vendor: req.user, amount: parseFloat(amount), method }).catch(() => {});

        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADMIN: list all payout requests
export const getAllPayouts = async (req, res) => {
    try {
        const payouts = await prisma.payoutRequest.findMany({
            include: { vendor: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(payouts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADMIN: process a payout request (approve/reject + optionally mark earnings as PAID)
export const processPayoutRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        if (!['PROCESSING', 'PAID', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const payout = await prisma.payoutRequest.findUnique({ where: { id } });
        if (!payout) return res.status(404).json({ error: 'Payout request not found' });

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.payoutRequest.update({
                where: { id },
                data: { status, note: note || null, processedAt: new Date() },
            });

            if (status === 'PAID') {
                // Mark approved earnings for this vendor as PAID up to the payout amount
                const approvedEarnings = await tx.earning.findMany({
                    where: { affiliateLink: { vendorId: payout.vendorId }, status: 'APPROVED' },
                    orderBy: { createdAt: 'asc' },
                });
                let remaining = payout.amount;
                for (const earning of approvedEarnings) {
                    if (remaining <= 0) break;
                    await tx.earning.update({ where: { id: earning.id }, data: { status: 'PAID' } });
                    remaining -= earning.amount;
                }
            }

            return updated;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
