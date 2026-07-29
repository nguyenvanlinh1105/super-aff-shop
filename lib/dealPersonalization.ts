import { prisma } from "./prisma";
import { createTrackingLink } from "./trackingLinkService";
import type { TrackingLink } from "@prisma/client";

type DealForPersonalization = {
  id: string;
  cleanLink: string;
  platformCode: string;
};

// Dùng chung cho MỌI kênh khách bấm/nhận link deal (web /go/[shortCode],
// /api/deals/[id]/click, Telegram /deals) — trước đây mỗi kênh tự viết lại
// y hệt logic này, dẫn tới Telegram bị bỏ sót hoàn toàn (luôn gửi link
// chung gán vào khách hệ thống SYSTEM). Gộp về 1 hàm để không lệch nhau
// nữa trong tương lai.
//
// Trả về TrackingLink cá nhân của đúng khách hàng cho deal này (tái dùng
// nếu đã có, tạo mới nếu chưa) — hoặc null nếu thất bại (LUÔN log rõ lý do,
// không được im lặng, vì im lặng từng khiến lỗi gán nhầm SYSTEM tồn tại
// hàng tuần mà không ai biết).
export async function getOrCreatePersonalDealLink(params: {
  customerId: string;
  deal: DealForPersonalization;
  channelSource: "web" | "zalo" | "telegram";
}): Promise<TrackingLink | null> {
  const { customerId, deal, channelSource } = params;

  try {
    let personalLink = await prisma.trackingLink.findFirst({
      where: { customerId, normalizedUrl: deal.cleanLink },
      orderBy: { createdAt: "desc" },
    });

    if (!personalLink) {
      const platform = await prisma.platform.findFirst({ where: { code: deal.platformCode } });
      if (!platform) {
        console.error(
          `[DEAL_PERSONALIZE_FALLBACK] customerId=${customerId} dealId=${deal.id} channel=${channelSource} reason=platform_not_found platformCode=${deal.platformCode}`
        );
        return null;
      }

      const result = await createTrackingLink({
        originalUrl: deal.cleanLink,
        platformId: platform.id,
        customerId,
        channelSource,
      });
      personalLink = result.link;
    }

    return personalLink;
  } catch (err) {
    console.error(
      `[DEAL_PERSONALIZE_FALLBACK] customerId=${customerId} dealId=${deal.id} channel=${channelSource} reason=exception`,
      err
    );
    return null;
  }
}
