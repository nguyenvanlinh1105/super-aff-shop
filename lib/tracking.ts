import { prisma } from "./prisma";

// Format theo 02-kien-truc-he-thong-web-zalo.md §6:
// {PLATFORM}_{CUSTOMER}_{CHANNEL}_{YYYYMMDD}_{SEQ}
// Ví dụ: SP_C123_WEB_20260711_0001
export async function generateTrackingCode(params: {
  platformCode: string;
  customerCode: string;
  channelSource: "web" | "zalo" | "telegram";
}): Promise<string> {
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const prefix = `${params.platformCode}_${params.customerCode}_${params.channelSource.toUpperCase()}_${datePart}_`;

  // Đếm toàn bộ link của khách hàng đã tạo trong ngày hôm nay (trên tất cả các sàn)
  // để số thứ tự _0001, _0002 tăng dần liên tục, không bị lặp lại _0001 khi đổi sàn
  const countToday = await prisma.trackingLink.count({
    where: {
      trackingCode: {
        contains: `_${params.customerCode}_${params.channelSource.toUpperCase()}_${datePart}_`,
      },
    },
  });

  const sequence = String(countToday + 1).padStart(4, "0");
  return `${prefix}${sequence}`;
}

export type ShopeeSubIds = {
  subId1: string;
  subId2: string;
  subId3: string;
  subId4: string;
  subId5: string;
};

export function buildShopeeSubIds(params: {
  customerCode: string;
  trackingCode: string;
  channelSource: "web" | "zalo" | "telegram";
  campaignCode?: string;
  reserveValue?: string;
}): ShopeeSubIds {
  return {
    subId1: params.customerCode,
    subId2: params.trackingCode,
    subId3: params.channelSource.toUpperCase(),
    subId4: params.campaignCode ?? "",
    subId5: params.reserveValue ?? "",
  };
}
