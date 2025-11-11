// src/controllers/post.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth'; // Kita pakai AuthRequest
import prisma from '../db';

// --- LOGIC BUAT POST ---
export const createPost = async (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  const userId = req.userId!; // Ambil userId dari middleware

  // 1. Validasi input
  if (!content) {
    return res.status(400).json({ message: "Content cannot be empty" });
  }

  // 2. Validasi panjang karakter
  if (content.length > 200) {
    return res.status(422).json({ message: "Post content must not exceed 200 characters" });
  }

  try {
    // 3. Buat post di database
    const newPost = await prisma.post.create({
      data: {
        content: content,
        user_id: userId
      },
      select: {
        id: true,
        user_id: true,
        content: true,
        created_at: true
      }
    });

    // Ganti nama field agar sesuai kontrak API
    const responsePost = {
      id: newPost.id,
      userid: newPost.user_id,
      content: newPost.content,
      createdat: newPost.created_at
    };

    res.status(201).json(responsePost);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- LOGIC GET NEWS FEED (BARU) ---
export const getFeed = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  // 1. Dapatkan query paginasi
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    // 2. Cari semua ID user yang Anda (userId) ikuti (follow)
    const following = await prisma.follows.findMany({
      where: {
        follower_id: userId,
      },
      select: {
        followee_id: true, // Hanya ambil ID yang di-follow
      },
    });

    // 3. Buat array berisi ID tersebut
    const followingIds = following.map((f) => f.followee_id);

    // 4. Jika Anda tidak mengikuti siapa pun, kirim balasan kosong
    if (followingIds.length === 0) {
      return res.status(200).json({
        page: page,
        posts: [], // Kirim array post kosong
      });
    }

    // 5. Cari semua postingan yang user_id-nya ada di dalam array followingIds
    const posts = await prisma.post.findMany({
      where: {
        user_id: {
          in: followingIds, // Kunci query-nya ada di sini
        },
      },
      orderBy: {
        created_at: 'desc', // Urutkan dari terbaru
      },
      skip: offset, // Paginasi
      take: limit,  // Paginasi
      select: { // Pilih data sesuai kontrak API
        id: true,
        user_id: true,
        content: true,
        created_at: true,
      },
    });

    // 6. Format ulang output agar sesuai kontrak API
    const responsePosts = posts.map((post) => ({
      id: post.id,
      userid: post.user_id,
      content: post.content,
      createdat: post.created_at,
    }));

    res.status(200).json({
      page: page,
      posts: responsePosts,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};