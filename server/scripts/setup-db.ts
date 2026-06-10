import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up PostgreSQL extensions...');
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    console.log('✅ Extensions ready');
  } catch (e) {
    console.warn('⚠️  Could not create extensions (may need superuser):', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
