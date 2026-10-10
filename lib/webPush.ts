import webpush from "web-push";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getPrisma() {
  if (prisma && (prisma as any).pushSubscription) {
    return prisma;
  }
  return new PrismaClient();
}

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
let rawSubject = process.env.VAPID_SUBJECT || "mailto:vanlinh11052004nguyenvan@gmail.com";
if (rawSubject && !rawSubject.startsWith("mailto:") && !rawSubject.startsWith("http://") && !rawSubject.startsWith("https://")) {
  rawSubject = `mailto:${rawSubject}`;
}
const vapidSubject = rawSubject;

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.error("Failed to initialize VAPID details:", err);
  }
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
};

async function cleanupSubscription(endpoint: string) {
  try {
    const dbAny = prisma as any;
    if (dbAny.pushSubscription?.deleteMany) {
      await dbAny.pushSubscription.deleteMany({
        where: { endpoint },
      });
    } else {
      await prisma.$executeRaw`
        DELETE FROM "push_subscriptions" WHERE "endpoint" = ${endpoint}
      `;
    }
  } catch (_) {}
}

/**
 * Gửi Web Push Notification tới 1 subscription đơn lẻ.
 * Tự động xóa subscription nếu token đã hết hạn (HTTP 410 hoặc 404) hoặc key không hợp lệ.
 */
export async function sendWebPush(
  subscription: { id?: string; endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("VAPID keys not configured. Skipping push notification.");
    return false;
  }

  // Kiểm tra tính hợp lệ của khóa p256dh trước khi gửi (chuỗi base64 phải giải mã ra đúng 65 bytes)
  try {
    const rawKey = Buffer.from(subscription.p256dh, "base64");
    if (rawKey.length !== 65) {
      console.warn(`Push subscription has invalid p256dh length (${rawKey.length} bytes != 65) for endpoint. Auto-cleaning...`);
      await cleanupSubscription(subscription.endpoint);
      return false;
    }
  } catch {
    await cleanupSubscription(subscription.endpoint);
    return false;
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const notificationData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/app",
    icon: payload.icon || "/meowback_lucky_cat_logo.png",
    badge: payload.badge || "/icon-192.png",
    tag: payload.tag || "meowback-notification",
  });

  try {
    await webpush.sendNotification(pushSubscription, notificationData);
    return true;
  } catch (err: any) {
    // 410 Gone hoặc 404 Not Found: token trên thiết bị đã bị hủy hoặc người dùng đã tắt quyền
    // Hoặc lỗi định dạng khóa p256dh: tự động dọn dẹp subscription hỏng
    if (err.statusCode === 410 || err.statusCode === 404 || err.message?.includes("65 bytes")) {
      console.log(`Push subscription invalid or expired for ${subscription.endpoint}. Cleaning up...`);
      await cleanupSubscription(subscription.endpoint);
    } else {
      console.warn("Web Push sendNotification notice:", err.message || err);
    }
    return false;
  }
}

/**
 * Gửi thông báo Web Push tới tất cả thiết bị của một user cụ thể.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const dbAny = prisma as any;
  let subscriptions: Array<{ endpoint: string; p256dh: string; auth: string }> = [];

  if (dbAny.pushSubscription?.findMany) {
    subscriptions = await dbAny.pushSubscription.findMany({
      where: { userId },
    });
  } else {
    subscriptions = await prisma.$queryRaw<Array<{ endpoint: string; p256dh: string; auth: string }>>`
      SELECT "endpoint", "p256dh", "auth" FROM "push_subscriptions" WHERE "user_id" = ${userId}
    `;
  }

  // Khử trùng lặp endpoint để 1 thiết bị không bao giờ nhận 2 lần
  const uniqueSubs = Array.from(
    new Map(subscriptions.map((s) => [s.endpoint, s])).values()
  );

  if (uniqueSubs.length === 0) return 0;

  const results = await Promise.allSettled(
    uniqueSubs.map((sub) => sendWebPush(sub, payload))
  );

  return results.filter((r) => r.status === "fulfilled" && r.value).length;
}

/**
 * Phát sóng thông báo Web Push tới TẤT CẢ thiết bị người dùng đã đăng ký.
 */
export async function sendPushToAll(payload: PushPayload): Promise<number> {
  const dbAny = prisma as any;
  let subscriptions: Array<{ endpoint: string; p256dh: string; auth: string }> = [];

  if (dbAny.pushSubscription?.findMany) {
    subscriptions = await dbAny.pushSubscription.findMany();
  } else {
    subscriptions = await prisma.$queryRaw<Array<{ endpoint: string; p256dh: string; auth: string }>>`
      SELECT "endpoint", "p256dh", "auth" FROM "push_subscriptions"
    `;
  }

  // Khử trùng lặp endpoint để 1 thiết bị không bao giờ nhận 2 lần
  const uniqueSubs = Array.from(
    new Map(subscriptions.map((s) => [s.endpoint, s])).values()
  );

  if (uniqueSubs.length === 0) return 0;

  // Gửi song song tối đa theo lô để tối ưu hiệu năng
  const batchSize = 25;
  let successCount = 0;

  for (let i = 0; i < uniqueSubs.length; i += batchSize) {
    const batch = uniqueSubs.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((sub) => sendWebPush(sub, payload))
    );
    successCount += results.filter((r) => r.status === "fulfilled" && r.value).length;
  }

  return successCount;
}
