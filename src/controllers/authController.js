const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');
const { createToken } = require('../lib/jwt');

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

async function signup(req, res, next) {
    try {
        const { email, password, name } = req.body;

        if (
            typeof email !== 'string'
            || typeof password !== 'string'
            || password.length < 6
            || (name !== undefined && typeof name !== 'string')
        ) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name: typeof name === 'string' && name.trim() ? name.trim() : null,
            },
        });

        const token = createToken(user);

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        if (error && error.code === 'P2002') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        return next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string'
            || typeof password !== 'string'
            || !normalizeEmail(email)
            || !password
        ) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = createToken(user);

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        return next(error);
    }
}

async function getProfile(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return next(error);
    }
}

async function getDashboard(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                email: true,
                name: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const displayName = user.name || user.email;
        return res.status(200).json({ message: `Welcome, ${displayName}!` });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    signup,
    login,
    getProfile,
    getDashboard,
};
