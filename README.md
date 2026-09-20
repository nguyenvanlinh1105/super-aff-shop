# Affiliate Hoàn Tiền — Web + Zalo (khung MVP)

Khung website affiliate hoàn tiền theo kế hoạch trong `01`–`05-*.md`, style theo `design.md`. Một app Next.js duy nhất (FE + API) dùng chung cho **Admin** và **Customer Portal**.

Database: **PostgreSQL** — phù hợp cho hệ thống sản phẩm thật, an toàn dữ liệu, hỗ trợ giao dịch cao (high concurrency) và nhiều tiến trình đồng thời.

## Chạy dự án

```bash
# 1. Cài dependency (nếu chưa)
npm install

# 2. Đồng bộ schema với PostgreSQL
npx prisma db push
# hoặc chạy migration:
# npx prisma migrate dev

# 3. Seed dữ liệu mẫu (nếu cần)
npm run prisma:seed

# 4. Chạy dev server
npm run dev
```

Mở http://localhost:3000

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@demo.vn | Demo@123 |
| Khách hàng | khach@demo.vn | Demo@123 |

## Biến môi trường (`.env`)

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL (vd: `postgresql://postgres:admin@localhost:5432/meowback_shop?schema=public`). |
| `SESSION_SECRET` | Có | Chuỗi ngẫu nhiên ký cookie phiên đăng nhập. |
| `ZALO_OA_VERIFY_TOKEN` | Khi bật Zalo | Token xác minh webhook GET từ Zalo. |
| `ZALO_OA_ACCESS_TOKEN` | Khi bật Zalo | Access token OA để gửi tin nhắn thật. |
| `ZALO_OA_MESSAGE_ENDPOINT` | Khi bật Zalo | Endpoint gửi tin nhắn của Zalo OA. |

Nếu chưa cấu hình `ZALO_OA_ACCESS_TOKEN`/`ZALO_OA_MESSAGE_ENDPOINT`, webhook vẫn xử lý link + lưu log bình thường nhưng phần gửi trả tin nhắn sẽ chạy ở chế độ mô phỏng (`simulated: true`), không gọi Zalo API thật.

## Cấu trúc

- `app/admin/*` — cổng quản trị (Dashboard, Khách hàng, Link, Voucher, Đơn hàng, Import đối soát, Thanh toán, Báo cáo, Zalo OA, Cấu hình).
- `app/app/*` — cổng khách hàng (Home, Hoàn tiền, Ví tiền, Đơn hàng, Sự kiện, Hướng dẫn).
- `app/api/*` — Route Handlers xử lý nghiệp vụ (tạo link, import CSV, thanh toán, webhook Zalo...).
- `prisma/schema.prisma` — schema PostgreSQL dịch từ `04-database-schema-khoi-dong.sql`.
- `lib/` — logic dùng chung: session, tracking code, chuyển đổi link, chia hoa hồng, parse CSV, tích hợp Zalo OA.

## Giới hạn đã biết (đúng cảnh báo trong 05-ghi-chu-nghien-cuu-va-rui-ro.md)

- Chưa gọi API affiliate Shopee/TikTok thật — `lib/linkConversion.ts` build link dạng mock gắn `sub_id1..5`, cần thay bằng tích hợp thật khi có tài khoản network.
- File bill/import lưu ở `storage/` local, chưa nối object storage thật (S3-compatible).
