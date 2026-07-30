/**
 * Seed demo: tao ~140 don hang trai 6 thang (Thg 2 - Thg 7 2026)
 * cho 5 customer hien co, chia deu Shopee / TikTok Shop.
 * Cac don co prefix DEMO- de co the xoa/re-run an toan.
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

const ITEMS = [
  ["Serum duong da Vitamin C 30ml", "My pham ABC Official"],
  ["Tai nghe Bluetooth chong on", "TechZone Store"],
  ["Ao thun cotton unisex form rong", "Fashion House VN"],
  ["Noi chien khong dau 5.5L", "Gia Dung Plus"],
  ["Sua rua mat diu nhe 150ml", "Beauty Corner"],
  ["Giay sneaker nam nu hot trend", "Sneaker World"],
  ["Binh giu nhiet inox 500ml", "HomeCare Shop"],
  ["Son kem li lau troi", "Lipstick Queen"],
  ["Ban phim co gaming RGB", "Gear Station"],
  ["Tui xach nu da PU cao cap", "Bags & More"],
  ["Kem chong nang SPF50+ PA++++", "SkinLab Official"],
  ["Do choi lego xep hinh 1000pcs", "Kids Toy Land"],
];

async function main() {
  // Xoa don demo cu de re-run an toan
  await p.paymentBatchItem.deleteMany({ where: { order: { orderExternalId: { startsWith: "DEMO-" } } } });
  await p.order.deleteMany({ where: { orderExternalId: { startsWith: "DEMO-" } } });

  const customers = await p.customer.findMany({ select: { id: true } });
  const platforms = await p.platform.findMany({ select: { id: true, code: true } });
  const links = await p.trackingLink.findMany({ select: { id: true, customerId: true, platformId: true } });

  // Trong so don theo thang: tang truong dan (thang 2 -> 7 / 2026)
  const months = [
    { y: 2026, m: 1, orders: 8 },   // Thg 2
    { y: 2026, m: 2, orders: 13 },  // Thg 3
    { y: 2026, m: 3, orders: 18 },  // Thg 4
    { y: 2026, m: 4, orders: 26 },  // Thg 5
    { y: 2026, m: 5, orders: 34 },  // Thg 6
    { y: 2026, m: 6, orders: 43 },  // Thg 7
  ];

  let seq = 1;
  const rows = [];
  for (const mo of months) {
    for (let i = 0; i < mo.orders; i++) {
      const customer = pick(customers);
      // 70% Shopee, 30% TikTok
      const platform = Math.random() < 0.7 ? platforms.find(x => x.code === "SHOPEE") : platforms.find(x => x.code === "TIKTOK");
      const link = pick(links.filter(l => l.customerId === customer.id && l.platformId === platform.id))
        || pick(links.filter(l => l.platformId === platform.id))
        || pick(links);

      const day = rand(1, 28);
      const date = new Date(mo.y, mo.m, day, rand(8, 22), rand(0, 59));

      const orderAmount = rand(80, 3500) * 1000;               // 80k - 3.5M
      const commissionRate = rand(4, 12) / 100;                 // 4% - 12%
      const commission = Math.round(orderAmount * commissionRate / 1000) * 1000;
      const reward = Math.round(commission * 0.8 / 500) * 500;  // hoan khach 80%
      const profit = commission - reward;

      // Trang thai: cac thang cu chu yeu approved, thang gan day co pending
      const monthsAgo = 6 - months.indexOf(mo);
      let orderStatus;
      const r = Math.random();
      if (monthsAgo >= 3) orderStatus = r < 0.9 ? "approved" : "cancelled";
      else if (monthsAgo === 2) orderStatus = r < 0.75 ? "approved" : (r < 0.9 ? "pending" : "cancelled");
      else orderStatus = r < 0.45 ? "approved" : (r < 0.9 ? "pending" : "cancelled");

      const payoutStatus = orderStatus === "approved" && monthsAgo >= 2 && Math.random() < 0.85 ? "paid" : "unpaid";
      const [itemName, shopName] = pick(ITEMS);

      rows.push({
        platformId: platform.id,
        customerId: customer.id,
        trackingLinkId: link ? link.id : null,
        orderExternalId: `DEMO-${String(seq++).padStart(5, "0")}`,
        orderedAt: date,
        completedAt: orderStatus === "approved" ? new Date(date.getTime() + 7 * 864e5) : null,
        approvedAt: orderStatus === "approved" ? new Date(date.getTime() + 10 * 864e5) : null,
        itemName, shopName,
        orderAmount,
        grossCommissionAmount: commission,
        netCommissionAmount: commission,
        commissionAmount: orderStatus === "cancelled" ? 0 : commission,
        customerRewardAmount: orderStatus === "cancelled" ? 0 : reward,
        systemProfitAmount: orderStatus === "cancelled" ? 0 : profit,
        orderStatus,
        payoutStatus,
        sourceType: "import",
        createdAt: date,
        updatedAt: date,
      });
    }
  }

  for (const row of rows) await p.order.create({ data: row });
  console.log(`Da tao ${rows.length} don hang demo (DEMO-xxxxx) trai ${months.length} thang.`);

  const total = await p.order.count();
  console.log(`Tong don hang trong DB: ${total}`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

/*
 ==============================================================================
 📖 HƯỚNG DẪN CÁCH CHẠY SCRIPT SEED DỮ LIỆU ĐƠN HÀNG DEMO (SEED DEMO ORDERS)
 ==============================================================================

 📌 Công dụng:
    Script này tự động sinh các đơn hàng mẫu (DEMO-xxxxx) trải dài 6 tháng gần nhất
    với đầy đủ các chỉ số: Hoa hồng sàn, Hoàn tiền khách, Lợi nhuận Admin, gán link & khách hàng.
    Giúp giao diện Admin Dashboard và các biểu đồ xu hướng hiển thị đẹp mắt, chân thực.

 🚀 Cách chạy từ Terminal / PowerShell:
    Mở terminal tại thư mục gốc của dự án (super-shop) và gõ lệnh:

    $ node scripts/seed-demo-orders.js

 💡 Lời khuyên:
    - Hãy đảm bảo đã chạy `npx prisma db push` hoặc DB PostgreSQL/SQLite đã sẵn sàng.
    - Script này hoàn toàn an toàn, có thể chạy lại bất cứ lúc nào khi cần dữ liệu mẫu.
 ==============================================================================
*/
