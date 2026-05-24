import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'fitplan-dev-secret-2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseProvider: process.env.DATABASE_PROVIDER || 'sqlite',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
} as const;

export type Config = typeof config;
