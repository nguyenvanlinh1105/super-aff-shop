import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralClient } from "@/components/customer/ReferralClient";

export default async function ReferralPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const [customer, referralOrders, activeRule] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        _count: {
          select: { referredUsers: true }
        },
        referredUsers: {
          orderBy: { createdAt: "desc" },
          select: { id: true, fullName: true, customerCode: true, createdAt: true },
        },
      }
    }),
    prisma.order.findMany({
      where: {
        customerId: session.customerId,
        sourceType: "referral"
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        platformId: true,
        orderExternalId: true,
        customerRewardAmount: true,
        orderStatus: true,
        createdAt: true,
        referralSourceCustomerId: true,
      }
    }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    })
  ]);

  if (!customer) redirect("/login");

  const friendIds = customer.referredUsers.map((f) => f.id);

  // Toàn bộ đơn THẬT của bạn bè (không phải đơn hoa hồng REF- tổng hợp) —
  // để người giới thiệu theo dõi được cả tiến trình (chờ duyệt/đối soát),
  // không phải chỉ biết khi nào đơn đã xong xuôi mới thấy.
  const friendOrders = friendIds.length
    ? await prisma.order.findMany({
        where: {
          customerId: { in: friendIds },
          orderStatus: { in: ["pending", "processing", "approved", "clawback"] },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerId: true,
          platformId: true,
          orderExternalId: true,
          orderStatus: true,
          customerRewardAmount: true,
          itemName: true,
          shopName: true,
          createdAt: true,
          trackingLink: { select: { productTitle: true } },
        },
      })
    : [];

  const approvedReferralOrders = referralOrders.filter((o) => o.orderStatus === "approved");
  const totalReferralCommission = approvedReferralOrders.reduce((sum, order) => sum + Number(order.customerRewardAmount), 0);
  const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;
  const maxReferralOrders = activeRule?.maxReferralOrders ?? 5;
  const referralValidityMonths = activeRule?.referralValidityMonths ?? 6;

  // Tiến trình đơn hàng THẬT của bạn bè — kể cả đơn đang "Chờ xác nhận"/
  // "Đang đối soát", không chỉ đơn đã xong. Người giới thiệu muốn theo dõi
  // ngay từ lúc bạn mình phát sinh đơn, không phải đợi tới khi có tiền mới
  // biết. Số tiền ở đơn chưa xong CHỈ LÀ DỰ KIẾN — số thật chỉ chốt khi đơn
  // "Đã hoàn tất" và hệ thống tạo đơn hoa hồng REF- tương ứng.
  const friendById = new Map(customer.referredUsers.map((f) => [f.id, f]));
  const refBonusByOriginalKey = new Map(
    referralOrders
      .filter((o) => o.orderExternalId.startsWith("REF-"))
      .map((o) => [`${o.platformId}:${o.orderExternalId.slice(4)}`, o])
  );

  // Đếm số đơn ĐÃ thật sự tạo hoa hồng của từng bạn — dùng để đoán trước
  // đơn đang chờ có còn nằm trong hạn mức {maxReferralOrders} đơn không
  // (chỉ áp dụng người giới thiệu thường, đối tác không giới hạn).
  const eligibleCountByFriend = new Map<string, number>();
  for (const fo of friendOrders) {
    const refBonus = refBonusByOriginalKey.get(`${fo.platformId}:${fo.orderExternalId}`);
    if (refBonus?.orderStatus === "approved" && fo.customerId) {
      eligibleCountByFriend.set(fo.customerId, (eligibleCountByFriend.get(fo.customerId) ?? 0) + 1);
    }
  }

  const friendOrderTimeline = friendOrders.map((fo) => {
    const friend = friendById.get(fo.customerId ?? "");
    const refBonus = refBonusByOriginalKey.get(`${fo.platformId}:${fo.orderExternalId}`);
    const estimatedBonus = Number(fo.customerRewardAmount) * referralRate;

    let bonusState: "received" | "clawed_back" | "not_eligible" | "pending_eligible" | "pending_capped";
    let bonusAmount: number;

    if (refBonus?.orderStatus === "approved") {
      bonusState = "received";
      bonusAmount = Number(refBonus.customerRewardAmount);
    } else if (refBonus?.orderStatus === "clawback") {
      bonusState = "clawed_back";
      bonusAmount = Number(refBonus.customerRewardAmount);
    } else if (fo.orderStatus === "approved") {
      bonusState = "not_eligible";
      bonusAmount = 0;
    } else {
      const already = eligibleCountByFriend.get(fo.customerId ?? "") ?? 0;
      const willBeCapped = !customer.isPartner && already >= maxReferralOrders;
      bonusState = willBeCapped ? "pending_capped" : "pending_eligible";
      bonusAmount = estimatedBonus;
    }

    return {
      id: fo.id,
      friendName: friend?.fullName ?? "Bạn bè",
      friendCode: friend?.customerCode ?? "",
      orderExternalId: fo.orderExternalId,
      itemName: fo.trackingLink?.productTitle ?? fo.itemName ?? null,
      shopName: fo.shopName,
      orderStatus: fo.orderStatus,
      createdAt: fo.createdAt.toISOString(),
      bonusState,
      bonusAmount,
    };
  });

  // Danh sách TOÀN BỘ bạn bè đã mời — kể cả người CHƯA từng tạo ra khoản hoa
  // hồng nào (chỉ mới đăng ký, chưa mua gì) — khác với bonusHistory chỉ có
  // các giao dịch đã phát sinh. Đối tác đặc biệt cần xem được danh sách này
  // để theo dõi toàn bộ khách mình quản lý, không chỉ phần đã có tiền về.
  const friends = customer.referredUsers.map((f) => {
    const theirBonusOrders = approvedReferralOrders.filter((o) => o.referralSourceCustomerId === f.id);
    return {
      id: f.id,
      fullName: f.fullName,
      customerCode: f.customerCode,
      joinedAt: f.createdAt.toISOString(),
      bonusOrderCount: theirBonusOrders.length,
      totalEarned: theirBonusOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0),
    };
  });

  return (
    <ReferralClient
      customerCode={customer.customerCode}
      totalFriends={customer._count.referredUsers}
      totalCommission={totalReferralCommission}
      referralRate={referralRate}
      maxReferralOrders={maxReferralOrders}
      referralValidityMonths={referralValidityMonths}
      isPartner={customer.isPartner}
      friends={friends}
      friendOrderTimeline={friendOrderTimeline}
    />
  );
}
