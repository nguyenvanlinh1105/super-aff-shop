import { prisma } from "./prisma";
import { sendPushToUser, sendPushToAll } from "./webPush";

export type NotificationType = "order_approved" | "payment_paid" | "referral_bonus" | "broadcast" | "system";

type NotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

/** Tạo thông báo trong app cho 1 khách hàng cụ thể — đồng thời gửi Web Push ra màn hình khóa nếu có đăng ký. */
export async function notifyCustomerInApp(customerId: string, data: NotificationInput) {
  const user = await prisma.user.findUnique({ where: { customerId }, select: { id: true } });
  if (!user) return;
  const created = await prisma.notification.create({ data: { userId: user.id, ...data } });

  // Gửi Web Push ra màn hình khóa ngầm không chặn luồng chính (kèm tag để tránh duplicate trên thiết bị)
  sendPushToUser(user.id, {
    title: data.title,
    body: data.message,
    url: data.link || "/app",
    tag: `meowback-notif-${created.id}`,
  }).catch((err) => console.error("Auto push error in notifyCustomerInApp:", err));
}

/** Gửi thông báo hệ thống cho toàn bộ khách hàng đang có tài khoản đăng nhập web — đồng thời phát Web Push. */
export async function broadcastNotification(data: NotificationInput) {
  const users = await prisma.user.findMany({ where: { role: "customer" }, select: { id: true } });
  if (users.length === 0) return 0;
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, ...data })),
  });

  // Tag đồng nhất cho đợt phát sóng này giúp OS tự động deduplicate nếu nhận lại
  const broadcastTag = `meowback-broadcast-${Date.now()}`;

  // Phát sóng Web Push tới toàn bộ thiết bị
  sendPushToAll({
    title: data.title,
    body: data.message,
    url: data.link || "/app",
    tag: broadcastTag,
  }).catch((err) => console.error("Auto push error in broadcastNotification:", err));

  return users.length;
}

/** Gửi thông báo trong app cho toàn bộ admin — dùng khi có sự kiện cần admin xử lý
 *  (VD: khách gửi yêu cầu rút tiền mới). */
export async function notifyAdminsInApp(data: NotificationInput) {
  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
  if (admins.length === 0) return 0;
  await prisma.notification.createMany({
    data: admins.map((u) => ({ userId: u.id, ...data })),
  });

  const adminTag = `meowback-admin-${Date.now()}`;
  // Gửi Web Push tới các admin
  Promise.allSettled(
    admins.map((a) =>
      sendPushToUser(a.id, {
        title: data.title,
        body: data.message,
        url: data.link || "/admin",
        tag: adminTag,
      })
    )
  ).catch((err) => console.error("Admin push error:", err));

  return admins.length;
}
