const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Kiem tra va cap nhat database sang SHOPEE_AFFILIATE_ID=17336430629...");

  // Update DB tracking links if any contain affiliate_id
  const links = await prisma.trackingLink.findMany({});
  console.log(`Tim thay ${links.length} tracking link trong CSDL.`);

  let updatedCount = 0;
  for (const link of links) {
    if (link.affiliateUrl && link.affiliateUrl.includes('affiliate_id=')) {
      const updatedUrl = link.affiliateUrl.replace(/affiliate_id=[^&]+/, 'affiliate_id=17336430629');
      if (updatedUrl !== link.affiliateUrl) {
        await prisma.trackingLink.update({
          where: { id: link.id },
          data: { affiliateUrl: updatedUrl }
        });
        updatedCount++;
      }
    }
  }

  // Update deal posts if any contain affiliate_id
  const deals = await prisma.dealPost.findMany({});
  console.log(`Tim thay ${deals.length} Deal trong CSDL.`);

  let updatedDealsCount = 0;
  for (const deal of deals) {
    if (deal.affiliateUrl && deal.affiliateUrl.includes('affiliate_id=')) {
      const updatedUrl = deal.affiliateUrl.replace(/affiliate_id=[^&]+/, 'affiliate_id=17336430629');
      if (updatedUrl !== deal.affiliateUrl) {
        await prisma.dealPost.update({
          where: { id: deal.id },
          data: { affiliateUrl: updatedUrl }
        });
        updatedDealsCount++;
      }
    }
  }

  console.log(`Hoan thanh! Da cap nhat ${updatedCount} tracking link va ${updatedDealsCount} bai dang Deal.`);
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
