import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
