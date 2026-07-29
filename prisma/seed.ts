import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildAffiliateUrl } from "../lib/linkConversion";
import { buildShopeeSubIds } from "../lib/tracking";
import { buildShortUrl } from "../lib/shortLink";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync("Demo@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.vn" },
    update: {},
    create: {
      email: "admin@demo.vn",
      passwordHash,
      fullName: "Quản trị viên",
      role: "admin",
    },
  });

  const shopee = await prisma.platform.upsert({
    where: { code: "SHOPEE" },
    update: {},
    create: { code: "SHOPEE", name: "Shopee" },
  });

  const tiktok = await prisma.platform.upsert({
    where: { code: "TIKTOK" },
    update: {},
    create: { code: "TIKTOK", name: "TikTok Shop" },
  });

  const customer = await prisma.customer.upsert({
    where: { customerCode: "C0001" },
    update: {
      fullName: "Nguyễn Văn Minh",
      zaloDisplayName: "Nguyễn Văn Minh",
    },
    create: {
      customerCode: "C0001",
      fullName: "Nguyễn Văn Minh",
      phone: "0901234567",
      zaloUserId: "zalo-demo-0001",
      zaloDisplayName: "Nguyễn Văn Minh",
    },
  });

  await prisma.user.upsert({
    where: { email: "khach@demo.vn" },
    update: {
      fullName: "Nguyễn Văn Minh",
    },
    create: {
      email: "khach@demo.vn",
      passwordHash,
      fullName: "Nguyễn Văn Minh",
      role: "customer",
      customerId: customer.id,
    },
  });

  await prisma.commissionRule.upsert({
    where: { id: "seed-default-rule" },
    update: {},
    create: {
      id: "seed-default-rule",
      name: "Mặc định 80/20",
      customerRate: 80,
      systemRate: 20,
      active: true,
    },
  });

  // Ty le hoa hong tinh tu du lieu doi soat that (AffiliateCommissionReport),
  // trung binh co trong so theo "Tong hoa hong san pham" / "Gia tri don hang"
  // cho tung nganh hang L1 cua Shopee — chinh xac hon nhieu so voi so lieu
  // tham khao tren mang, vi day la hoa hong thuc te da tra cho don cua chinh
  // he thong nay. "Khac" dung trung binh co trong so toan bo file (7.87%).
  const categoryRates: { name: string; keywords: string; rate: number; sortOrder: number; isDefault?: boolean }[] = [
    { name: "Giày Dép Nữ", keywords: "giày nữ,dép nữ,sandal,giày cao gót,giày đế bằng,giày sục nữ,xăng đan,xăng-đan", rate: 13.1, sortOrder: 1 },
    { name: "Phụ Kiện Thời Trang", keywords: "túi xách,ví,thắt lưng,mũ,nón,kính mát,kính mắt,trang sức,dây chuyền,vòng tay,bông tai,phụ kiện tóc,găng tay", rate: 12.28, sortOrder: 2 },
    { name: "Túi Ví Nam", keywords: "ví nam,ví cầm tay nam", rate: 12, sortOrder: 3 },
    { name: "Sắc Đẹp", keywords: "kem,serum,mỹ phẩm,son,sữa rửa mặt,dưỡng da,toner,mặt nạ,nước hoa,dầu gội,dầu xả,trang điểm,tẩy trang", rate: 10.69, sortOrder: 4 },
    { name: "Thời Trang Nữ", keywords: "áo nữ,đầm,váy,chân váy,quần nữ,babydoll,vest nữ,jumpsuit,bộ nữ,đồ lót,đồ ngủ,quần jean nữ", rate: 10.6, sortOrder: 5 },
    { name: "Túi Ví Nữ", keywords: "túi xách nữ,túi đeo chéo,túi quai xách,ví nữ", rate: 9.44, sortOrder: 6 },
    { name: "Văn Phòng Phẩm", keywords: "giấy,sổ,bút,văn phòng phẩm,quà tặng giấy gói", rate: 9.5, sortOrder: 7 },
    { name: "Thời Trang Nam", keywords: "áo nam,quần nam,quần jean nam,sơ mi nam,áo thun nam,áo polo nam", rate: 9.37, sortOrder: 8 },
    { name: "Giày Dép Nam", keywords: "giày nam,dép nam,giày sục nam", rate: 9.17, sortOrder: 9 },
    { name: "Sức Khỏe", keywords: "khẩu trang,vitamin,thực phẩm chức năng,vật tư y tế,chăm sóc cá nhân", rate: 8.84, sortOrder: 10 },
    { name: "Thời trang trẻ em & trẻ sơ sinh", keywords: "quần áo bé,đồ bộ bé,giày bé trai,giày bé gái,phụ kiện trẻ em", rate: 8.65, sortOrder: 11 },
    { name: "Điện Thoại & Phụ Kiện", keywords: "điện thoại,iphone,samsung,ốp lưng,tai nghe,sạc,cáp,dán màn hình", rate: 8.4, sortOrder: 12 },
    { name: "Thể Thao & Dã Ngoại", keywords: "giày thể thao,vali,balo du lịch,dụng cụ thể thao,quần áo thể thao,đồ tập gym,yoga", rate: 8.33, sortOrder: 13 },
    { name: "Sở thích & Sưu tầm", keywords: "mô hình,đồ chơi,quà lưu niệm,đồ sưu tầm,dụng cụ may vá", rate: 7.9, sortOrder: 14 },
    { name: "Thực phẩm và đồ uống", keywords: "thực phẩm,bánh kẹo,đồ ăn,nước uống,cà phê,trà,sữa,ngũ cốc,đồ ăn vặt", rate: 7.22, sortOrder: 15 },
    { name: "Máy tính & Laptop", keywords: "laptop,máy tính,usb,ổ cứng,bàn phím,chuột", rate: 7, sortOrder: 16 },
    { name: "Nhà cửa & Đời sống", keywords: "nồi,chảo,máy xay,quạt,đèn,nội thất,chăn ga gối,dụng cụ nhà bếp,trang trí nhà cửa", rate: 6.21, sortOrder: 17 },
    { name: "Sách & Tạp Chí", keywords: "sách,tạp chí,truyện", rate: 6, sortOrder: 18 },
    { name: "Thiết Bị Điện Gia Dụng", keywords: "tủ lạnh,máy giặt,điều hòa,tivi,lò vi sóng,máy chiếu,nồi cơm điện,quạt điện", rate: 5.95, sortOrder: 19 },
    { name: "Phụ tùng & Phụ kiện xe cơ giới", keywords: "phụ kiện ô tô,phụ kiện xe,giá đỡ điện thoại xe,thảm taplo", rate: 5.86, sortOrder: 20 },
    { name: "Chăm Sóc Thú Cưng", keywords: "thức ăn cho mèo,thức ăn cho chó,pate,hạt cho mèo,thú cưng", rate: 2.72, sortOrder: 21 },
    { name: "Khác", keywords: "", rate: 7.87, sortOrder: 99, isDefault: true },
  ];

  for (const c of categoryRates) {
    await prisma.categoryCommissionRate.upsert({
      where: { id: `seed-category-${c.sortOrder}` },
      update: c,
      create: { id: `seed-category-${c.sortOrder}`, ...c },
    });
  }

  await prisma.voucher.upsert({
    where: { id: "seed-voucher-shopee-1" },
    update: {},
    create: {
      id: "seed-voucher-shopee-1",
      platformId: shopee.id,
      title: "Giảm 50K đơn từ 300K",
      voucherCode: "SHOPEE50K",
      benefitText: "Giảm trực tiếp 50.000đ cho đơn hàng từ 300.000đ",
      status: "active",
      priority: 1,
    },
  });

  await prisma.voucher.upsert({
    where: { id: "seed-voucher-tiktok-1" },
    update: {},
    create: {
      id: "seed-voucher-tiktok-1",
      platformId: tiktok.id,
      title: "Freeship toàn sàn",
      voucherCode: "TTFREESHIP",
      benefitText: "Miễn phí vận chuyển cho mọi đơn hàng",
      status: "active",
      priority: 1,
    },
  });

  await prisma.telegramAccount.upsert({
    where: { id: "seed-telegram-account-1" },
    update: {
      botName: "MeowBack Hoàn Tiền Bot",
      botUsername: "meowback_bot",
      botTokenHint: "configured-via-env",
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/telegram/webhook`,
      status: "active",
    },
    create: {
      id: "seed-telegram-account-1",
      botName: "MeowBack Hoàn Tiền Bot",
      botUsername: "meowback_bot",
      botTokenHint: "configured-via-env",
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/telegram/webhook`,
      status: "active",
    },
  });

  const seedAffiliateUrl = await buildAffiliateUrl(
    "https://shopee.vn/product/123456",
    "SHOPEE_C0001_WEB_20260710_0001",
    buildShopeeSubIds({
      customerCode: customer.customerCode,
      trackingCode: "SHOPEE_C0001_WEB_20260710_0001",
      channelSource: "web",
    }),
    { platformCode: "SHOPEE" }
  );

  const trackingLink = await prisma.trackingLink.upsert({
    where: { trackingCode: "SHOPEE_C0001_WEB_20260710_0001" },
    update: {},
    create: {
      id: "seed-link-1",
      customerId: customer.id,
      platformId: shopee.id,
      channelSource: "web",
      trackingCode: "SHOPEE_C0001_WEB_20260710_0001",
      originalUrl: "https://shopee.vn/product/123456",
      normalizedUrl: "https://shopee.vn/product/123456",
      shortCode: "N8xNQXu",
      shortUrl: buildShortUrl("N8xNQXu"),
      ...buildShopeeSubIds({
        customerCode: customer.customerCode,
        trackingCode: "SHOPEE_C0001_WEB_20260710_0001",
        channelSource: "web",
      }),
      affiliateUrl: seedAffiliateUrl,
      createdByUserId: admin.id,
    },
  });

  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260710001" } },
    update: {},
    create: {
      id: "seed-order-1",
      platformId: shopee.id,
      customerId: customer.id,
      trackingLinkId: trackingLink.id,
      orderExternalId: "SP20260710001",
      trackingCode: trackingLink.trackingCode,
      orderAmount: 350000,
      commissionAmount: 20000,
      customerRewardAmount: 16000,
      systemProfitAmount: 4000,
      orderStatus: "approved",
      payoutStatus: "unpaid",
      sourceType: "import",
      approvedAt: new Date(),
    },
  });

  console.log("Seed hoàn tất.");
  console.log("Đăng nhập admin: admin@demo.vn / Demo@123");
  console.log("Đăng nhập khách: khach@demo.vn / Demo@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
