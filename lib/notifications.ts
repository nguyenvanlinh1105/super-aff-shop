import { prisma } from "./prisma";

export type NotificationType = "order_approved" | "payment_paid" | "referral_bonus" | "broadcast" | "system";

type NotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

/** Tạo thông báo trong app cho 1 khách hàng cụ thể — bỏ qua nếu khách chưa có tài khoản đăng nhập web. */
export async function notifyCustomerInApp(customerId: string, data: NotificationInput) {
  const user = await prisma.user.findUnique({ where: { customerId }, select: { id: true } });
  if (!user) return;
  await prisma.notification.create({ data: { userId: user.id, ...data } });
}

/** Gửi thông báo hệ thống cho toàn bộ khách hàng đang có tài khoản đăng nhập web. */
export async function broadcastNotification(data: NotificationInput) {
  const users = await prisma.user.findMany({ where: { role: "customer" }, select: { id: true } });
  if (users.length === 0) return 0;
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, ...data })),
  });
  return users.length;
}
