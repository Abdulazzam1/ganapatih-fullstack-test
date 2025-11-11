// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import prisma from '../db'; // Import Prisma dari db.ts
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- 1. LOGIC REGISTRASI ---
export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        username: true
      }
    });

    res.status(201).json(user);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: "Username already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- 2. LOGIC LOGIN ---
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // FIX: Gunakan 'as string' untuk mengatasi error TypeScript
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string, // <-- PERBAIKAN
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET as string, // <-- PERBAIKAN
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
    });

    res.status(200).json({
      token: accessToken
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- 3. LOGIC REFRESH TOKEN ---
export const refresh = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    // FIX: Gunakan 'as string'
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string // <-- PERBAIKAN
    ) as { userId: number; username: string };

    // FIX: Gunakan 'as string'
    const newAccessToken = jwt.sign(
      { userId: payload.userId, username: payload.username },
      process.env.JWT_SECRET as string, // <-- PERBAIKAN
      { expiresIn: '15m' }
    );

    res.status(200).json({ token: newAccessToken });

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};