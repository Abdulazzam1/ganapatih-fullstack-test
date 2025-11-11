// src/db.ts
import { PrismaClient } from '@prisma/client';

// Ini memastikan kita hanya punya satu koneksi Prisma di seluruh aplikasi
const prisma = new PrismaClient();

export default prisma;