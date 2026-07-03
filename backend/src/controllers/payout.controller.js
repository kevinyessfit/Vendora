import prisma from '../lib/prisma.js';
import { sendPayoutRequestNotification } from '../services/email.service.js';

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

        // Balance is derived from payout amounts (authoritative), not from flipping
        // individual earning statuses — atomic earnings can't map exactly to an
        // arbitrary payout amount. availableForPayout = approved − paid − in-flight.
        const approved = earnings.filter(e => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0);
        const pending = earnings.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);
        const paid = payoutRequests
            .filter(p => p.status === 'PAID')
            .reduce((s, p) => s + p.amount, 0);
        const inFlight = payoutRequests
            .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
            .reduce((s, p) => s + p.amount, 0);

        res.json({
            summary: { approved, paid, pending, availableForPayout: approved - paid - inFlight },
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

        const amt = parseFloat(amount);
        if (!(amt > 0)) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        // available = approved earnings − everything already committed to payouts
        // (PENDING + PROCESSING reserve funds, PAID has consumed them).
        const [earnings, committedPayouts] = await Promise.all([
            prisma.earning.findMany({
                where: { affiliateLink: { vendorId: req.user.id }, status: 'APPROVED' },
            }),
            prisma.payoutRequest.aggregate({
                where: { vendorId: req.user.id, status: { in: ['PENDING', 'PROCESSING', 'PAID'] } },
                _sum: { amount: true },
            }),
        ]);
        const approvedBalance = earnings.reduce((s, e) => s + e.amount, 0);
        const committed = committedPayouts._sum.amount || 0;
        const actualAvailable = approvedBalance - committed;

        if (amt > actualAvailable) {
            return res.status(400).json({
                error: `Insufficient balance. Available: $${actualAvailable.toFixed(2)}`,
            });
        }

        const request = await prisma.payoutRequest.create({
            data: { vendorId: req.user.id, amount: amt, method, details },
        });

        sendPayoutRequestNotification({ vendor: req.user, amount: amt, method }).catch(() => {});

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

// ADMIN: process a payout request (mark PROCESSING / PAID / REJECTED)
export const processPayoutRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        if (!['PROCESSING', 'PAID', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const payout = await prisma.payoutRequest.findUnique({ where: { id } });
        if (!payout) return res.status(404).json({ error: 'Payout request not found' });

        // The payout amount itself is the source of truth for the vendor's balance
        // (see getMyEarnings). No per-earning flipping — that could over/under-count
        // when a payout doesn't align to whole-earning boundaries.
        const updated = await prisma.payoutRequest.update({
            where: { id },
            data: { status, note: note || null, processedAt: new Date() },
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
