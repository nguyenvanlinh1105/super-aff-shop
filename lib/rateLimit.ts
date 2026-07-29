import { NextRequest } from "next/server";

// Giới hạn tốc độ đơn giản, lưu trong bộ nhớ tiến trình — đủ dùng vì PM2
// chạy app này ở chế độ "fork" (1 tiến trình duy nhất), không phải cluster,
// nên không cần Redis để đồng bộ giữa nhiều tiến trình. Reset khi app
// restart — chấp nhận được cho mục đích chặn brute-force/spam.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Dọn định kỳ để Map không phình vô hạn theo số IP truy cập.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref?.();

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Trả về { allowed: false, retryAfterSeconds } nếu vượt hạn mức, ngược lại
// { allowed: true } và tự tăng bộ đếm cho lần gọi này.
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= maxAttempts) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}
