import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service.js';

const prisma = new PrismaClient();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const validRoles = ['MERCHANT', 'VENDOR'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Choose MERCHANT or VENDOR' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'Email already in use' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        const token = generateToken(user.id);
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = generateToken(user.id);
        const { password: _, ...userWithoutPass } = user;
        res.json({ token, user: userWithoutPass });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMe = async (req, res) => {
    const { password: _, ...user } = req.user;
    res.json({ user });
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name && !email) return res.status(400).json({ error: 'Nothing to update' });

        if (email && email !== req.user.email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) return res.status(409).json({ error: 'Email already in use' });
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { ...(name && { name }), ...(email && { email }) },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        res.json({ user: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords are required' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const user = await prisma.user.findUnique({ where: { email } });
        // Always return the same message to prevent email enumeration
        const successMsg = { message: 'If this email exists, a reset link has been sent.' };
        if (!user) return res.json(successMsg);

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
        await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, user.name, resetUrl);

        res.json(successMsg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
        if (!resetToken) return res.status(400).json({ error: 'Invalid or expired reset link' });
        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
            return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
        }

        const hashed = await bcrypt.hash(password, 10);
        await prisma.$transaction([
            prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashed } }),
            prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
        ]);

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
