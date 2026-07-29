import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getOrCreatePersonalDealLink } from "@/lib/dealPersonalization";

export async function GET(_: NextRequest, { params }: { params: { shortCode: string } }) {
  // 1. Thử tìm trong TrackingLink trước
  const link = await prisma.trackingLink.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (link) {
    if (link.status !== "active") {
      return new NextResponse("Link không tồn tại hoặc đã ngừng hoạt động", { status: 404 });
    }
    await prisma.trackingLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
    });
    return NextResponse.redirect(link.affiliateUrl, { status: 302 });
  }

  // 2. Thử tìm trong DealPost (deal giảm giá)
  const deal = await prisma.dealPost.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (deal) {
    if (deal.status !== "active") {
      return new NextResponse("Deal không còn hoạt động", { status: 404 });
    }

    // Nếu khách ĐÃ ĐĂNG NHẬP bấm vào deal — bắt buộc map đúng link cá nhân
    // của CHÍNH KHÁCH ĐÓ (không map vào SYSTEM nữa), để hoa hồng tính đúng
    // cho họ y hệt như tự tay tạo link ở mục "Tạo link hoàn tiền".
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
        return NextResponse.redirect(personalLink.affiliateUrl, { status: 302 });
      }
    }

    // Khách chưa đăng nhập, hoặc tạo link cá nhân thất bại — dùng link
    // công khai chung (map vào SYSTEM) như trước.
    prisma.dealPost.update({
      where: { id: deal.id },
      data: { clicks: { increment: 1 } },
    }).catch(() => {});
    return NextResponse.redirect(deal.affiliateUrl, { status: 302 });
  }

  return new NextResponse("Link không tồn tại", { status: 404 });
}
