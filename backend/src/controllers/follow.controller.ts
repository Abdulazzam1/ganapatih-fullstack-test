// src/controllers/follow.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import { Prisma } from '@prisma/client';

// --- LOGIC FOLLOW USER ---
export const followUser = async (req: AuthRequest, res: Response) => {
  const followeeId = parseInt(req.params.userid!, 10);
  const followerId = req.userId!;

  // 1. Validasi: Tidak bisa follow diri sendiri
  if (followerId === followeeId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    // 2. Cek apakah user yang ingin di-follow ada
    const followee = await prisma.user.findUnique({
      where: { id: followeeId },
    });

    if (!followee) {
      return res.status(404).json({ message: "User to follow not found" });
    }

    // 3. Buat relasi 'follow'
    await prisma.follows.create({
      data: {
        follower_id: followerId,
        followee_id: followeeId,
      },
    });

    res.status(200).json({ message: `You are now following user ${followee.username}` });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: "You are already following this user" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- LOGIC UNFOLLOW USER ---
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  const followeeId = parseInt(req.params.userid!, 10);
  const followerId = req.userId!;

  try {
    // 1. Hapus relasi 'follow'
    await prisma.follows.delete({
      where: {
        follower_id_followee_id: {
          follower_id: followerId,
          followee_id: followeeId,
        },
      },
    });

    res.status(200).json({ message: `You have unfollowed user ${followeeId}` });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: "You are not following this user" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- LOGIC GET FOLLOWING IDS (BARU) ---
export const getFollowing = async (req: AuthRequest, res: Response) => {
  const followerId = req.userId!;
  try {
    const following = await prisma.follows.findMany({
      where: {
        follower_id: followerId,
      },
      select: {
        followee_id: true, // Hanya kirim daftar ID
      },
    });
    // Ubah dari [ { followee_id: 5 }, { followee_id: 7 } ] menjadi [ 5, 7 ]
    const followingIds = following.map((f) => f.followee_id);
    res.status(200).json(followingIds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};