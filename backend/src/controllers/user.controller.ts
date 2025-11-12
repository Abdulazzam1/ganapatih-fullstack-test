// src/controllers/user.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import { Prisma } from '@prisma/client';

// --- LOGIC GET ALL USERS ---
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const myUserId = req.userId!;

  try {
    // Cari semua user, KECUALI diri sendiri
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: myUserId, // Jangan tampilkan diri sendiri
        },
      },
      select: {
        id: true,
        username: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};