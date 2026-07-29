import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getOrCreatePersonalDealLink } from "@/lib/dealPersonalization";

// Route dự phòng — chỉ dùng khi deal thiếu shortUrl (đường chính là
// /go/[shortCode]). Áp dụng ĐÚNG logic cá nhân hoá y hệt /go/[shortCode]:
// khách đã đăng nhập phải map vào link cá nhân của CHÍNH họ, không phải
// link chung của deal, nếu không hoa hồng sẽ bị tính nhầm vào SYSTEM.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const deal = await prisma.dealPost.findUnique({ where: { id: params.id } });
  if (!deal) {
    return NextResponse.json({ error: "Không tìm thấy deal" }, { status: 404 });
  }
  if (deal.status !== "active") {
    return new NextResponse("Deal không còn hoạt động", { status: 404 });
  }

  const session = await getSession();
  if (session?.customerId) {
    const personalLink = await getOrCreatePersonalDealLink({
      customerId: session.customerId,
      deal: { id: deal.id, cleanLink: deal.cleanLink, platformCode: deal.platformCode },
      channelSource: "web",
    });

    if (personalLink) {
      await prisma.trackingLink.update({
        where: { id: personalLink.id },
        data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
      });
      prisma.dealPost.update({ where: { id: deal.id }, data: { clicks: { increment: 1 } } }).catch(() => {});
      return NextResponse.redirect(personalLink.affiliateUrl);
    }
  }

  // Khách chưa đăng nhập, hoặc tạo link cá nhân thất bại — dùng link chung.
  prisma.dealPost.update({
    where: { id: params.id },
    data: { clicks: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.redirect(deal.affiliateUrl);
}
