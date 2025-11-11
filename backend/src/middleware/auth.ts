import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Kita perlu menambahkan 'userId' dan 'username' ke tipe Request
export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Ambil token dari header Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Format "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" }); // [cite: 50-51]
  }

  try {
    // 2. Verifikasi token
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number; username: string };

    // 3. Jika valid, tambahkan info user ke request
    req.userId = payload.userId;
    req.username = payload.username;
    next(); // Lanjut ke endpoint selanjutnya
  } catch (error) {
    // Jika token tidak valid (expired, dll)
    res.status(401).json({ message: "Token is not valid, authorization denied" }); // [cite: 50-51]
  }
};