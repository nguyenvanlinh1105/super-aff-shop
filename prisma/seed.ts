import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 2 Tài khoản Quản trị viên (Admin) chính thức của hệ thống
const ADMIN_CONFIGS = [
  {
    email: "vanlinh11052004nguyenvan@gmail.com",
    fullName: "Nguyễn Văn Linh",
  },
  {
    email: "trannam6362@gmail.com",
    fullName: "Trần Nam",
  },
];

async function seedAdmins() {
  console.log("\n👤 Thiết lập tài khoản Admin...");
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || "Admin@123";
  const passwordHash = bcrypt.hashSync(initialPassword, 10);

  for (const admin of ADMIN_CONFIGS) {
    const existing = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existing) {
      await prisma.user.update({
        where: { email: admin.email },
        data: {
          role: "admin",
          status: "active",
          fullName: existing.fullName || admin.fullName,
          customerId: null,
        },
      });
      console.log(`  ✓ Cập nhật quyền Admin: ${admin.email} (giữ nguyên mật khẩu hiện tại)`);
    } else {
      await prisma.user.create({
        data: {
          email: admin.email,
          fullName: admin.fullName,
          passwordHash,
          role: "admin",
          status: "active",
          customerId: null,
        },
      });
      console.log(`  ✓ Tạo mới Admin: ${admin.email} (mật khẩu khởi tạo: ${initialPassword})`);
    }
  }
}

async function seedPlatforms() {
  console.log("\n🛒 Cấu hình nền tảng Affiliate (Shopee, TikTok, Lazada)...");
  const platforms = [
    { code: "SHOPEE", name: "Shopee" },
    { code: "TIKTOK", name: "TikTok Shop" },
    { code: "LAZADA", name: "Lazada" },
  ];

  for (const p of platforms) {
    const result = await prisma.platform.upsert({
      where: { code: p.code },
      update: { name: p.name, status: "active" },
      create: { code: p.code, name: p.name, status: "active" },
    });
    console.log(`  ✓ Nền tảng: ${result.name} (${result.code})`);
  }
}

async function seedCommissionRule() {
  console.log("\n💰 Cấu hình tỷ lệ hoàn tiền mặc định (Commission Rule)...");
  const existingActiveRule = await prisma.commissionRule.findFirst({
    where: { active: true },
  });

  if (existingActiveRule) {
    console.log(
      `  ✓ Đã có luật hoạt động: "${existingActiveRule.name}" (Khách: ${existingActiveRule.customerRate}%, Hệ thống: ${existingActiveRule.systemRate}%). Giữ nguyên cấu hình.`
    );
  } else {
    const newRule = await prisma.commissionRule.upsert({
      where: { id: "default-commission-rule" },
      update: { active: true },
      create: {
        id: "default-commission-rule",
        name: "Mặc định 80/20",
        customerRate: 80,
        systemRate: 20,
        taxRate: 10.98,
        referralRate: 0.05,
        maxReferralOrders: 5,
        referralValidityMonths: 6,
        active: true,
      },
    });
    console.log(`  ✓ Đã tạo luật hoàn tiền: "${newRule.name}" (Khách nhận 80%, Hệ thống 20%).`);
  }
}

async function seedCategoryCommissionRates() {
  console.log("\n📊 Cấu hình tỷ lệ hoàn tiền ước tính theo 22 nhóm ngành hàng...");

  const categoryRates: {
    id: string;
    name: string;
    keywords: string;
    rate: number;
    sortOrder: number;
    isDefault?: boolean;
  }[] = [
    { id: "category-rate-1", name: "Giày Dép Nữ", keywords: "giày nữ,dép nữ,sandal,giày cao gót,giày đế bằng,giày sục nữ,xăng đan,xăng-đan", rate: 13.1, sortOrder: 1 },
    { id: "category-rate-2", name: "Phụ Kiện Thời Trang", keywords: "túi xách,ví,thắt lưng,mũ,nón,kính mát,kính mắt,trang sức,dây chuyền,vòng tay,bông tai,phụ kiện tóc,găng tay", rate: 12.28, sortOrder: 2 },
    { id: "category-rate-3", name: "Túi Ví Nam", keywords: "ví nam,ví cầm tay nam", rate: 12, sortOrder: 3 },
    { id: "category-rate-4", name: "Sắc Đẹp", keywords: "kem,serum,mỹ phẩm,son,sữa rửa mặt,dưỡng da,toner,mặt nạ,nước hoa,dầu gội,dầu xả,trang điểm,tẩy trang", rate: 10.69, sortOrder: 4 },
    { id: "category-rate-5", name: "Thời Trang Nữ", keywords: "áo nữ,đầm,váy,chân váy,quần nữ,babydoll,vest nữ,jumpsuit,bộ nữ,đồ lót,đồ ngủ,quần jean nữ", rate: 10.6, sortOrder: 5 },
    { id: "category-rate-6", name: "Túi Ví Nữ", keywords: "túi xách nữ,túi đeo chéo,túi quai xách,ví nữ", rate: 9.44, sortOrder: 6 },
    { id: "category-rate-7", name: "Văn Phòng Phẩm", keywords: "giấy,sổ,bút,văn phòng phẩm,quà tặng giấy gói", rate: 9.5, sortOrder: 7 },
    { id: "category-rate-8", name: "Thời Trang Nam", keywords: "áo nam,quần nam,quần jean nam,sơ mi nam,áo thun nam,áo polo nam", rate: 9.37, sortOrder: 8 },
    { id: "category-rate-9", name: "Giày Dép Nam", keywords: "giày nam,dép nam,giày sục nam", rate: 9.17, sortOrder: 9 },
    { id: "category-rate-10", name: "Sức Khỏe", keywords: "khẩu trang,vitamin,thực phẩm chức năng,vật tư y tế,chăm sóc cá nhân", rate: 8.84, sortOrder: 10 },
    { id: "category-rate-11", name: "Thời trang trẻ em & trẻ sơ sinh", keywords: "quần áo bé,đồ bộ bé,giày bé trai,giày bé gái,phụ kiện trẻ em", rate: 8.65, sortOrder: 11 },
    { id: "category-rate-12", name: "Điện Thoại & Phụ Kiện", keywords: "điện thoại,iphone,samsung,ốp lưng,tai nghe,sạc,cáp,dán màn hình", rate: 8.4, sortOrder: 12 },
    { id: "category-rate-13", name: "Thể Thao & Dã Ngoại", keywords: "giày thể thao,vali,balo du lịch,dụng cụ thể thao,quần áo thể thao,đồ tập gym,yoga", rate: 8.33, sortOrder: 13 },
    { id: "category-rate-14", name: "Sở thích & Sưu tầm", keywords: "mô hình,đồ chơi,quà lưu niệm,đồ sưu tầm,dụng cụ may vá", rate: 7.9, sortOrder: 14 },
    { id: "category-rate-15", name: "Thực phẩm và đồ uống", keywords: "thực phẩm,bánh kẹo,đồ ăn,nước uống,cà phê,trà,sữa,ngũ cốc,đồ ăn vặt", rate: 7.22, sortOrder: 15 },
    { id: "category-rate-16", name: "Máy tính & Laptop", keywords: "laptop,máy tính,usb,ổ cứng,bàn phím,chuột", rate: 7, sortOrder: 16 },
    { id: "category-rate-17", name: "Nhà cửa & Đời sống", keywords: "nồi,chảo,máy xay,quạt,đèn,nội thất,chăn ga gối,dụng cụ nhà bếp,trang trí nhà cửa", rate: 6.21, sortOrder: 17 },
    { id: "category-rate-18", name: "Sách & Tạp Chí", keywords: "sách,tạp chí,truyện", rate: 6, sortOrder: 18 },
    { id: "category-rate-19", name: "Thiết Bị Điện Gia Dụng", keywords: "tủ lạnh,máy giặt,điều hòa,tivi,lò vi sóng,máy chiếu,nồi cơm điện,quạt điện", rate: 5.95, sortOrder: 19 },
    { id: "category-rate-20", name: "Phụ tùng & Phụ kiện xe cơ giới", keywords: "phụ kiện ô tô,phụ kiện xe,giá đỡ điện thoại xe,thảm taplo", rate: 5.86, sortOrder: 20 },
    { id: "category-rate-21", name: "Chăm Sóc Thú Cưng", keywords: "thức ăn cho mèo,thức ăn cho chó,pate,hạt cho mèo,thú cưng", rate: 2.72, sortOrder: 21 },
    { id: "category-rate-99", name: "Khác", keywords: "", rate: 7.87, sortOrder: 99, isDefault: true },
  ];

  for (const c of categoryRates) {
    const existing = await prisma.categoryCommissionRate.findFirst({
      where: {
        OR: [
          { id: c.id },
          { id: `seed-category-${c.sortOrder}` },
          { sortOrder: c.sortOrder },
          { name: c.name },
        ],
      },
    });

    if (existing) {
      await prisma.categoryCommissionRate.update({
        where: { id: existing.id },
        data: {
          name: c.name,
          keywords: c.keywords,
          rate: c.rate,
          sortOrder: c.sortOrder,
          isDefault: c.isDefault ?? false,
        },
      });
    } else {
      await prisma.categoryCommissionRate.create({
        data: {
          id: c.id,
          name: c.name,
          keywords: c.keywords,
          rate: c.rate,
          sortOrder: c.sortOrder,
          isDefault: c.isDefault ?? false,
        },
      });
    }
  }
  console.log(`  ✓ Đã đồng bộ ${categoryRates.length} nhóm ngành hàng thành công.`);
}

async function seedTelegramAccount() {
  console.log("\n🤖 Kiểm tra cấu hình Telegram Bot...");
  const existing = await prisma.telegramAccount.findFirst();

  if (existing) {
    console.log(`  ✓ Đã có Telegram Bot: "${existing.botName}" (@${existing.botUsername || "chưa set"}). Giữ nguyên.`);
  } else {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await prisma.telegramAccount.create({
      data: {
        id: "default-telegram-account",
        botName: "MeowBack Hoàn Tiền Bot",
        botUsername: "meowback_bot",
        botTokenHint: "configured-via-env",
        webhookUrl: `${appUrl}/api/telegram/webhook`,
        status: "active",
      },
    });
    console.log(`  ✓ Đã tạo cấu hình Telegram Bot mặc định.`);
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("   🚀 MEOWBACK PRODUCTION SEED — KHỞI TẠO DỮ LIỆU BAN ĐẦU");
  console.log("═══════════════════════════════════════════════════════════");

  await seedAdmins();
  await seedPlatforms();
  await seedCommissionRule();
  await seedCategoryCommissionRates();
  await seedTelegramAccount();

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  ✅ SEED HOÀN TẤT THÀNH CÔNG");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Danh sách Admin:");
  for (const admin of ADMIN_CONFIGS) {
    console.log(`  - ${admin.fullName} <${admin.email}> [role: admin]`);
  }
  console.log("  Mật khẩu khởi tạo (nếu tạo mới): " + (process.env.ADMIN_INITIAL_PASSWORD || "Admin@123"));
  console.log("═══════════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi thực hiện seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
