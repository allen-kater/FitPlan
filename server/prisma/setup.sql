-- FitPlan PostgreSQL 初始化脚本
-- 在 prisma db push 之前执行，确保 uuid 扩展可用

-- 启用 uuid-ossp 扩展（Prisma @default(uuid()) 需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 可选：启用 pgcrypto（gen_random_uuid() 备用方案）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
