import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildAffiliateUrl } from "../lib/linkConversion";
import { buildShopeeSubIds } from "../lib/tracking";
import { buildShortUrl } from "../lib/shortLink";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync("Demo@123", 10);

  // ── Cleanup: xoá dữ liệu seed cũ của C0002–C0005 để re-run không bị lỗi unique constraint ──
  // Thứ tự xoá: từ bảng con → bảng cha (do foreign key)
  const seedCustomerCodes = ["C0002", "C0003", "C0004", "C0005"];
  const existingCustomers = await prisma.customer.findMany({
    where: { customerCode: { in: seedCustomerCodes } },
    select: { id: true },
  });
  const existingIds = existingCustomers.map((c) => c.id);
  if (existingIds.length > 0) {
    await prisma.withdrawRequest.deleteMany({ where: { customerId: { in: existingIds } } });
    await prisma.paymentBatchItem.deleteMany({
      where: { paymentBatch: { customerId: { in: existingIds } } },
    });
    await prisma.paymentBatch.deleteMany({ where: { customerId: { in: existingIds } } });
    await prisma.order.deleteMany({ where: { customerId: { in: existingIds } } });
    await prisma.trackingLink.deleteMany({ where: { customerId: { in: existingIds } } });
    await prisma.telegramLinkCode.deleteMany({ where: { customerId: { in: existingIds } } });
    await prisma.zaloMessageLog.deleteMany({ where: { customerId: { in: existingIds } } });
    await prisma.telegramMessageLog.deleteMany({ where: { customerId: { in: existingIds } } });
    await prisma.notification.deleteMany({
      where: { user: { customerId: { in: existingIds } } },
    });
    await prisma.chatMessage.deleteMany({
      where: { user: { customerId: { in: existingIds } } },
    });
    await prisma.user.deleteMany({ where: { customerId: { in: existingIds } } });
    // Xoá referral links (referredById) trước khi xoá customer
    await prisma.customer.updateMany({
      where: { referredById: { in: existingIds } },
      data: { referredById: null },
    });
    await prisma.customer.deleteMany({ where: { id: { in: existingIds } } });
  }

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

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOMER 1 — Nguyễn Văn Minh (C0001)
  // Trạng thái: 1 đơn approved + unpaid, CHƯA gửi yêu cầu rút tiền
  // Mục đích: Khách có tiền nhưng chưa chủ động rút — admin KHÔNG nên
  //           thấy ở tab "Yêu cầu rút tiền"
  // ═══════════════════════════════════════════════════════════════════════
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

  // ── Tracking link + Order cho C0001 ──────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOMER 2 — Trần Thị Hoa (C0002)
  // Trạng thái: 2 đơn approved + 1 đơn pending, ĐÃ gửi yêu cầu rút tiền
  // Mục đích: Admin thấy yêu cầu rút tiền + có đơn sẵn sàng trả
  // ═══════════════════════════════════════════════════════════════════════
  const customer2 = await prisma.customer.upsert({
    where: { customerCode: "C0002" },
    update: {},
    create: {
      customerCode: "C0002",
      fullName: "Trần Thị Hoa",
      phone: "0912345678",
      bankName: "Vietcombank (Ngân hàng TMCP Ngoại thương VN)",
      bankAccountNumber: "0021000456789",
      bankAccountName: "TRAN THI HOA",
    },
  });

  await prisma.user.upsert({
    where: { email: "khach2@demo.vn" },
    update: { customerId: customer2.id },
    create: {
      email: "khach2@demo.vn",
      passwordHash,
      fullName: "Trần Thị Hoa",
      role: "customer",
      customerId: customer2.id,
    },
  });

  // Tracking link cho C0002
  const affUrl2 = await buildAffiliateUrl(
    "https://shopee.vn/product/200001",
    "SHOPEE_C0002_WEB_20260715_0001",
    buildShopeeSubIds({
      customerCode: "C0002",
      trackingCode: "SHOPEE_C0002_WEB_20260715_0001",
      channelSource: "web",
    }),
    { platformCode: "SHOPEE" }
  );

  const link2 = await prisma.trackingLink.upsert({
    where: { trackingCode: "SHOPEE_C0002_WEB_20260715_0001" },
    update: {},
    create: {
      id: "seed-link-2",
      customerId: customer2.id,
      platformId: shopee.id,
      channelSource: "web",
      trackingCode: "SHOPEE_C0002_WEB_20260715_0001",
      originalUrl: "https://shopee.vn/product/200001",
      normalizedUrl: "https://shopee.vn/product/200001",
      ...buildShopeeSubIds({
        customerCode: "C0002",
        trackingCode: "SHOPEE_C0002_WEB_20260715_0001",
        channelSource: "web",
      }),
      affiliateUrl: affUrl2,
      productTitle: "Áo thun nam cotton cao cấp",
      productPrice: 189000,
    },
  });

  // 2 đơn approved
  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260715001" } },
    update: {},
    create: {
      id: "seed-order-2a",
      platformId: shopee.id,
      customerId: customer2.id,
      trackingLinkId: link2.id,
      orderExternalId: "SP20260715001",
      trackingCode: link2.trackingCode,
      orderAmount: 189000,
      commissionAmount: 17700,
      customerRewardAmount: 14160,
      systemProfitAmount: 3540,
      orderStatus: "approved",
      payoutStatus: "unpaid",
      sourceType: "import",
      approvedAt: new Date("2026-07-20"),
    },
  });

  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260715002" } },
    update: {},
    create: {
      id: "seed-order-2b",
      platformId: shopee.id,
      customerId: customer2.id,
      trackingLinkId: link2.id,
      orderExternalId: "SP20260715002",
      trackingCode: link2.trackingCode,
      orderAmount: 450000,
      commissionAmount: 42000,
      customerRewardAmount: 33600,
      systemProfitAmount: 8400,
      orderStatus: "approved",
      payoutStatus: "unpaid",
      sourceType: "import",
      approvedAt: new Date("2026-07-22"),
    },
  });

  // 1 đơn pending (chưa đối soát)
  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260725001" } },
    update: {},
    create: {
      id: "seed-order-2c",
      platformId: shopee.id,
      customerId: customer2.id,
      trackingLinkId: link2.id,
      orderExternalId: "SP20260725001",
      trackingCode: link2.trackingCode,
      orderAmount: 299000,
      commissionAmount: 28000,
      customerRewardAmount: 22400,
      systemProfitAmount: 5600,
      orderStatus: "pending",
      payoutStatus: "unpaid",
      sourceType: "import",
    },
  });

  // ✅ WithdrawRequest — yêu cầu rút tiền pending
  await prisma.withdrawRequest.upsert({
    where: { id: "seed-wr-c0002" },
    update: {},
    create: {
      id: "seed-wr-c0002",
      customerId: customer2.id,
      amount: 47760,  // 14160 + 33600
      status: "pending",
      createdAt: new Date("2026-07-28T10:30:00"),
    },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOMER 3 — Lê Văn Dũng (C0003)
  // Trạng thái: 1 đơn pending (chưa đối soát), ĐÃ gửi yêu cầu rút tiền
  // Mục đích: **BUG CASE** — Khách đã gửi yêu cầu rút nhưng admin KHÔNG
  //           thấy trong code cũ vì không có đơn approved nào. Code mới
  //           phải hiển thị yêu cầu này với ghi chú "0đ sẵn sàng trả".
  // ═══════════════════════════════════════════════════════════════════════
  const customer3 = await prisma.customer.upsert({
    where: { customerCode: "C0003" },
    update: {},
    create: {
      customerCode: "C0003",
      fullName: "Lê Văn Dũng",
      phone: "0933456789",
      bankName: "MB (Ngân hàng TMCP Quân đội)",
      bankAccountNumber: "68686868686",
      bankAccountName: "LE VAN DUNG",
    },
  });

  await prisma.user.upsert({
    where: { email: "khach3@demo.vn" },
    update: { customerId: customer3.id },
    create: {
      email: "khach3@demo.vn",
      passwordHash,
      fullName: "Lê Văn Dũng",
      role: "customer",
      customerId: customer3.id,
    },
  });

  const affUrl3 = await buildAffiliateUrl(
    "https://shopee.vn/product/300001",
    "SHOPEE_C0003_WEB_20260720_0001",
    buildShopeeSubIds({
      customerCode: "C0003",
      trackingCode: "SHOPEE_C0003_WEB_20260720_0001",
      channelSource: "web",
    }),
    { platformCode: "SHOPEE" }
  );

  const link3 = await prisma.trackingLink.upsert({
    where: { trackingCode: "SHOPEE_C0003_WEB_20260720_0001" },
    update: {},
    create: {
      id: "seed-link-3",
      customerId: customer3.id,
      platformId: shopee.id,
      channelSource: "web",
      trackingCode: "SHOPEE_C0003_WEB_20260720_0001",
      originalUrl: "https://shopee.vn/product/300001",
      normalizedUrl: "https://shopee.vn/product/300001",
      ...buildShopeeSubIds({
        customerCode: "C0003",
        trackingCode: "SHOPEE_C0003_WEB_20260720_0001",
        channelSource: "web",
      }),
      affiliateUrl: affUrl3,
      productTitle: "Tai nghe Bluetooth chống ồn",
      productPrice: 599000,
    },
  });

  // Chỉ có đơn pending — chưa đối soát
  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260720001" } },
    update: {},
    create: {
      id: "seed-order-3a",
      platformId: shopee.id,
      customerId: customer3.id,
      trackingLinkId: link3.id,
      orderExternalId: "SP20260720001",
      trackingCode: link3.trackingCode,
      orderAmount: 599000,
      commissionAmount: 50300,
      customerRewardAmount: 40240,
      systemProfitAmount: 10060,
      orderStatus: "pending",
      payoutStatus: "unpaid",
      sourceType: "import",
    },
  });

  // ✅ WithdrawRequest — yêu cầu rút tiền (BUG: code cũ không hiển thị cái này)
  await prisma.withdrawRequest.upsert({
    where: { id: "seed-wr-c0003" },
    update: {},
    create: {
      id: "seed-wr-c0003",
      customerId: customer3.id,
      amount: 40240,
      status: "pending",
      createdAt: new Date("2026-07-29T08:15:00"),
    },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOMER 4 — Phạm Minh Tuấn (C0004)
  // Trạng thái: 2 đơn approved, CHƯA gửi yêu cầu rút tiền
  // Mục đích: Khách có tiền sẵn sàng nhưng chưa chủ động rút — admin
  //           KHÔNG nên thấy ở tab "Yêu cầu rút tiền", chỉ thấy khi
  //           admin chủ động tạo phiếu ở tab "Tạo phiếu chủ động".
  // ═══════════════════════════════════════════════════════════════════════
  const customer4 = await prisma.customer.upsert({
    where: { customerCode: "C0004" },
    update: {},
    create: {
      customerCode: "C0004",
      fullName: "Phạm Minh Tuấn",
      phone: "0944567890",
      bankName: "Techcombank (Ngân hàng TMCP Kỹ thương VN)",
      bankAccountNumber: "19034567890",
      bankAccountName: "PHAM MINH TUAN",
    },
  });

  await prisma.user.upsert({
    where: { email: "khach4@demo.vn" },
    update: { customerId: customer4.id },
    create: {
      email: "khach4@demo.vn",
      passwordHash,
      fullName: "Phạm Minh Tuấn",
      role: "customer",
      customerId: customer4.id,
    },
  });

  const affUrl4 = await buildAffiliateUrl(
    "https://shopee.vn/product/400001",
    "SHOPEE_C0004_WEB_20260718_0001",
    buildShopeeSubIds({
      customerCode: "C0004",
      trackingCode: "SHOPEE_C0004_WEB_20260718_0001",
      channelSource: "web",
    }),
    { platformCode: "SHOPEE" }
  );

  const link4 = await prisma.trackingLink.upsert({
    where: { trackingCode: "SHOPEE_C0004_WEB_20260718_0001" },
    update: {},
    create: {
      id: "seed-link-4",
      customerId: customer4.id,
      platformId: shopee.id,
      channelSource: "web",
      trackingCode: "SHOPEE_C0004_WEB_20260718_0001",
      originalUrl: "https://shopee.vn/product/400001",
      normalizedUrl: "https://shopee.vn/product/400001",
      ...buildShopeeSubIds({
        customerCode: "C0004",
        trackingCode: "SHOPEE_C0004_WEB_20260718_0001",
        channelSource: "web",
      }),
      affiliateUrl: affUrl4,
      productTitle: "Bộ chăn ga gối cotton 4 món",
      productPrice: 890000,
    },
  });

  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260718001" } },
    update: {},
    create: {
      id: "seed-order-4a",
      platformId: shopee.id,
      customerId: customer4.id,
      trackingLinkId: link4.id,
      orderExternalId: "SP20260718001",
      trackingCode: link4.trackingCode,
      orderAmount: 890000,
      commissionAmount: 55200,
      customerRewardAmount: 44160,
      systemProfitAmount: 11040,
      orderStatus: "approved",
      payoutStatus: "unpaid",
      sourceType: "import",
      approvedAt: new Date("2026-07-25"),
    },
  });

  await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260718002" } },
    update: {},
    create: {
      id: "seed-order-4b",
      platformId: shopee.id,
      customerId: customer4.id,
      trackingLinkId: link4.id,
      orderExternalId: "SP20260718002",
      trackingCode: link4.trackingCode,
      orderAmount: 250000,
      commissionAmount: 23400,
      customerRewardAmount: 18720,
      systemProfitAmount: 4680,
      orderStatus: "approved",
      payoutStatus: "unpaid",
      sourceType: "import",
      approvedAt: new Date("2026-07-26"),
    },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOMER 5 — Hoàng Thị Mai (C0005)
  // Trạng thái: 1 đơn approved + đã paid (lịch sử thanh toán)
  // Mục đích: Kiểm tra lịch sử thanh toán hiển thị đúng trong tab
  //           "Lịch sử phiếu" và trong ví khách hàng.
  // ═══════════════════════════════════════════════════════════════════════
  const customer5 = await prisma.customer.upsert({
    where: { customerCode: "C0005" },
    update: {},
    create: {
      customerCode: "C0005",
      fullName: "Hoàng Thị Mai",
      phone: "0955678901",
      bankName: "VPBank (Ngân hàng TMCP VN Thịnh Vượng)",
      bankAccountNumber: "1234567890",
      bankAccountName: "HOANG THI MAI",
    },
  });

  await prisma.user.upsert({
    where: { email: "khach5@demo.vn" },
    update: { customerId: customer5.id },
    create: {
      email: "khach5@demo.vn",
      passwordHash,
      fullName: "Hoàng Thị Mai",
      role: "customer",
      customerId: customer5.id,
    },
  });

  const affUrl5 = await buildAffiliateUrl(
    "https://shopee.vn/product/500001",
    "SHOPEE_C0005_WEB_20260710_0001",
    buildShopeeSubIds({
      customerCode: "C0005",
      trackingCode: "SHOPEE_C0005_WEB_20260710_0001",
      channelSource: "web",
    }),
    { platformCode: "SHOPEE" }
  );

  const link5 = await prisma.trackingLink.upsert({
    where: { trackingCode: "SHOPEE_C0005_WEB_20260710_0001" },
    update: {},
    create: {
      id: "seed-link-5",
      customerId: customer5.id,
      platformId: shopee.id,
      channelSource: "web",
      trackingCode: "SHOPEE_C0005_WEB_20260710_0001",
      originalUrl: "https://shopee.vn/product/500001",
      normalizedUrl: "https://shopee.vn/product/500001",
      ...buildShopeeSubIds({
        customerCode: "C0005",
        trackingCode: "SHOPEE_C0005_WEB_20260710_0001",
        channelSource: "web",
      }),
      affiliateUrl: affUrl5,
      productTitle: "Son môi lì cao cấp MAC",
      productPrice: 420000,
    },
  });

  // Đơn đã thanh toán xong
  const order5 = await prisma.order.upsert({
    where: { platformId_orderExternalId: { platformId: shopee.id, orderExternalId: "SP20260710005" } },
    update: {},
    create: {
      id: "seed-order-5a",
      platformId: shopee.id,
      customerId: customer5.id,
      trackingLinkId: link5.id,
      orderExternalId: "SP20260710005",
      trackingCode: link5.trackingCode,
      orderAmount: 420000,
      commissionAmount: 44900,
      customerRewardAmount: 35920,
      systemProfitAmount: 8980,
      orderStatus: "approved",
      payoutStatus: "paid",
      sourceType: "import",
      approvedAt: new Date("2026-07-15"),
    },
  });

  // PaymentBatch đã thanh toán — lịch sử
  const batch5 = await prisma.paymentBatch.upsert({
    where: { id: "seed-batch-c0005" },
    update: {},
    create: {
      id: "seed-batch-c0005",
      paymentCode: `PB1721500000000`,
      customerId: customer5.id,
      totalAmount: 35920,
      status: "paid",
      transferReference: "FT26072000001",
      transferNote: "Thanh toán hoàn tiền tháng 7",
      paidAt: new Date("2026-07-20"),
    },
  });

  await prisma.paymentBatchItem.upsert({
    where: { paymentBatchId_orderId: { paymentBatchId: batch5.id, orderId: order5.id } },
    update: {},
    create: {
      paymentBatchId: batch5.id,
      orderId: order5.id,
      amount: 35920,
    },
  });

  // Đóng withdraw request cũ của C0005 (đã fulfilled)
  await prisma.withdrawRequest.upsert({
    where: { id: "seed-wr-c0005" },
    update: {},
    create: {
      id: "seed-wr-c0005",
      customerId: customer5.id,
      amount: 35920,
      status: "fulfilled",
      createdAt: new Date("2026-07-18T14:00:00"),
      resolvedAt: new Date("2026-07-20T10:00:00"),
    },
  });

  console.log("\n✅ Seed hoàn tất.\n");
  console.log("══════════════════════════════════════════════════");
  console.log("  Tài khoản đăng nhập (mật khẩu chung: Demo@123)");
  console.log("══════════════════════════════════════════════════");
  console.log("  Admin:   admin@demo.vn");
  console.log("  Khách 1: khach@demo.vn  (C0001 — Nguyễn Văn Minh)");
  console.log("  Khách 2: khach2@demo.vn (C0002 — Trần Thị Hoa)     → có yêu cầu rút tiền + đơn approved");
  console.log("  Khách 3: khach3@demo.vn (C0003 — Lê Văn Dũng)      → có yêu cầu rút tiền + KHÔNG có đơn approved");
  console.log("  Khách 4: khach4@demo.vn (C0004 — Phạm Minh Tuấn)   → có đơn approved nhưng CHƯA gửi yêu cầu rút");
  console.log("  Khách 5: khach5@demo.vn (C0005 — Hoàng Thị Mai)    → đã thanh toán xong (lịch sử)");
  console.log("══════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
