const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const platforms = [
    { code: 'SHOPEE', name: 'Shopee', defaultStatus: 'active' },
    { code: 'TIKTOK', name: 'TikTok Shop', defaultStatus: 'active' },
    { code: 'LAZADA', name: 'Lazada', defaultStatus: 'inactive' },
  ];

  for (const p of platforms) {
    const existing = await prisma.platform.findUnique({ where: { code: p.code } });
    if (existing) {
      console.log(`  ✓ Nền tảng: ${existing.name} (${existing.code}) [${existing.status}] (Giữ nguyên)`);
    } else {
      const created = await prisma.platform.create({
        data: { code: p.code, name: p.name, status: p.defaultStatus },
      });
      console.log(`  ✓ Khởi tạo: ${created.name} (${created.code}) [${created.status}]`);
    }
  }
  console.log('Platforms seeded successfully');
}

main().finally(() => prisma.$disconnect());
