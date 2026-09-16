import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
    const { email, password, role } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(409).json({ error: "User already exists with this email" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const assignedRole = role === "admin" ? "admin" : "student";

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                role: assignedRole
            }
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            token,
            role: user.role,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            role: user.role,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/me", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, role: true }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({ user });
    } catch (err) {
        console.error("Auth /me error:", err);
        res.status(500).json({ error: "Server error fetching user" });
    }
});

export default router;