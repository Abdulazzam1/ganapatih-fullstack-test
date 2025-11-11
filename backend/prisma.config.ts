// Ganti 'require' kembali menjadi 'import'
import "dotenv/config"; 
import { defineConfig, env } from "prisma/config";

// Sisa file biarkan sama
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});