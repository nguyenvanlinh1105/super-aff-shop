const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.platform.upsert({
    where: { code: 'TIKTOK' },
    update: {},
    create: { code: 'TIKTOK', name: 'TikTok Shop', status: 'inactive' },
  });
  await prisma.platform.upsert({
    where: { code: 'LAZADA' },
    update: {},
    create: { code: 'LAZADA', name: 'Lazada', status: 'inactive' },
  });
  console.log('Platforms seeded');
}

main().finally(() => prisma.$disconnect());
