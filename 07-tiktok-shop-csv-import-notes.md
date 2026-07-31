# Ghi Chú & Kế Hoạch Tích Hợp Import CSV TikTok Shop Affiliate 🎵

> **Tài liệu:** Kế Hoạch & Quy Ước Đối Soát Import Đơn Hàng TikTok Shop  
> **Áp dụng cho:** Hệ Thống Hoàn Tiền MeowBack (Song song với Shopee Affiliate)

---

## 1. Cấu Trúc Báo Cáo CSV TikTok Shop Affiliate

Báo cáo đối soát hoa hồng export từ **TikTok Shop Seller Center / TikTok Shop Affiliate Partner**:

- **Tên File Thường Gặp:** `TikTok_Shop_Affiliate_Orders_YYYYMMDD.csv` hoặc `Commission_Report_TikTok.csv`
- **Định Dạng:** UTF-8 CSV / TSV (Cách nhau bằng dấu phẩy `,` hoặc dấu chấm phẩy `;`)

---

## 2. Quy Ước Map Cột Dữ Liệu Khi Import

| Cột Trong File CSV TikTok Shop | Trường Dữ Liệu Trong Database MeowBack | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- |
| `Order ID` / `Order No.` | `externalOrderId` | Mã đơn hàng duy nhất trên TikTok |
| `Sub ID` / `sub_id2` / `Passthrough` | `subId2` | **Mã tracking đối soát** (VD: `TIKTOK_C0001_WEB_20260731_0001`) |
| `Order Status` / `Status` | `orderStatus` | Trạng thái đơn (`Completed`, `Settled`, `Cancelled`, `Refunded`) |
| `Order Time` / `Created Time` | `orderedAt` | Thời gian khách đặt đơn |
| `Complete Time` / `Settled Time` | `completedAt` | Thời gian đơn hoàn tất đối soát |
| `Shop Name` / `Seller Name` | `shopName` | Tên shop trên TikTok Shop |
| `Product Name` / `SKU Name` | `itemName` | Tên sản phẩm khách mua |
| `Order Amount` / `GMV` (₫) | `orderAmount` | Giá trị đơn hàng |
| `Est. Commission` / `Commission` (₫)| `commissionAmount` | Hoa hồng gộp nhận từ TikTok |

---

## 3. Quy Chuẩn Mã Tracking Đối Soát (`sub_id2`)

Khi người dùng chuyển đổi link TikTok Shop trên Web hoặc Telegram Bot, hệ thống sẽ tự động gắn mã `sub_id2`:

```text
TIKTOK_{CUSTOMER_CODE}_{CHANNEL}_{YYYYMMDD}_{SEQ}
```

*Ví dụ:* `TIKTOK_C0001_WEB_20260731_0001`
- `TIKTOK`: Nền tảng TikTok Shop.
- `C0001`: Mã định danh khách hàng.
- `WEB`: Kênh tạo link (Web hoặc Telegram).
- `20260731`: Ngày tạo link.
- `0001`: Số thứ tự link trong ngày.

---

## 4. Công Thức Chia Hoa Hồng TikTok Shop

1. **Tổng hoa hồng từ TikTok:** `commissionAmount`
2. **Khấu trừ Thuế TNCN (10.98%):** `HH_sau_thue = commissionAmount * (1 - 0.1098)`
3. **Hoàn tiền cho Khách (80%):** `customerRewardAmount = HH_sau_thue * 0.8`
4. **Lợi nhuận Admin giữ (20%):** `systemProfitAmount = HH_sau_thue * 0.2`
5. **Thưởng giới thiệu bạn bè (5%):** `referralBonus = HH_sau_thue * 0.05`

---

## 5. Danh Sách Các File Cần Xây Dựng & Cập Nhật

### A. Mô-đun Xử Lý Backend & Parse CSV
- **[NEW] `lib/tiktokAffiliateCsv.ts`**: Thư viện đọc & chuẩn hóa dữ liệu từ file CSV TikTok Shop.
- **[MODIFY] `app/api/orders/import/route.ts`**: Tự động phát hiện loại file (Shopee hay TikTok) dựa trên Header CSV và gọi handler phù hợp.

### B. Mở Khóa Telegram Bot Đổi Link TikTok
- **[MODIFY] `app/api/telegram/webhook/route.ts`**: Mở khóa nhận diện link TikTok (`vt.tiktok.com`, `tiktok.com/@...`), tự động sinh link affiliate kèm `sub_id2` cho khách trên Telegram.

### C. Giao Diện Admin & Khách Hàng
- **[MODIFY] `components/admin/AdminOrdersClient.tsx`**: Thêm bộ lọc nền tảng (Shopee vs TikTok Shop) & Badge logo TikTok.
- **[MODIFY] `components/admin/AdminImportClient.tsx`**: Cho phép chọn loại file CSV (Shopee hoặc TikTok Shop) hoặc tự động nhận diện.

---

## 6. Hướng Dẫn Thao Tác Tải File CSV Từ TikTok Shop

### 💻 Cách 1: Thao Tác Trên Máy Tính (Web Portal - Nhanh & Đầy Đủ Nhất)
1. Truy cập trực tiếp cổng quản lý: **[TikTok Shop Creator Center](https://affiliate.tiktok.com/)** (hoặc **[TikTok Shop Seller Center](https://seller-vn.tiktok.com/)**).
2. Đăng nhập tài khoản TikTok có Giỏ hàng (🛍️).
3. Ở menu bên trái ➔ Chọn **Hoa hồng (Commissions)** ➔ Chọn **Chi tiết đơn hàng (Order Details / Report)**.
4. Chọn khoảng thời gian đối soát (Ví dụ: Từ 01/07/2026 đến 31/07/2026).
5. Nhìn sang góc trên bên phải ➔ Bấm **Xuất báo cáo (Export)** ➔ Chọn định dạng **File CSV** để tải về máy.

### 📱 Cách 2: Thao Tác Trên Ứng Dụng TikTok (Điện Thoại)
1. Mở ứng dụng **TikTok** trên điện thoại ➔ Chọn **Hồ sơ (Profile)** ➔ Bấm biểu tượng **Giỏ hàng (🛍️)**.
2. Bấm chọn nút **Sàn nhà sáng tạo (TikTok Shop / Center)**.
3. Chọn mục **Hoa hồng (Commissions)** ➔ Chọn **Đơn hàng tiếp thị (Affiliate Orders)**.
4. Bấm vào nút **Xuất dữ liệu / Gửi báo cáo qua Email** ở góc trên màn hình.
5. Nhập địa chỉ Email ➔ TikTok sẽ tự động gửi file `.csv` chứa danh sách đơn hàng đã bán về hòm thư của bạn!


