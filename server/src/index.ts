import { config } from './config/index.js';
import { app } from './app.js';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(config.port, () => {
      console.log(`🚀 FitPlan server running on http://localhost:${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // prisma.$disconnect() is intentionally not called here
    // because the server should keep the connection alive
  });
