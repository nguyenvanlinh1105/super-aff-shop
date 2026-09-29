# Kế Hoạch Chi Tiết: Phát Triển Chức Năng Xác Thực 2 Bước (2MFA) Cho Admin 🛡️

> **Tài liệu:** Kế Hoạch Tải & Triển Khai Xác Thực 2 Bước (Multi-Factor Authentication - 2MFA)  
> **Áp dụng cho:** Tài khoản Quản trị viên (Admin Role) trên hệ thống MeowBack  
> **Mục tiêu:** Tăng cường bảo mật cấp doanh nghiệp, chống Brute-force mã 6 số, bảo vệ tuyệt đối dữ liệu đối soát & số dư hệ thống.

---

## 1. 🚨 Giải Quyết Các Lỗ Hổng Bảo Mật & Yêu Cầu Quan Trọng

### 🛡️ A. Chống Brute-Force Mã 6 Số (Rate Limiting & Lockout)
- **Vấn đề:** Mã 6 chữ số có 1.000.000 khả năng (000000 - 999999). Nếu không giới hạn số lần thử, kẻ tấn công có thể quét tự động (brute-force) thành công trong vài giờ.
- **Giải pháp:**
  - Áp dụng **Rate Limiter nghiêm ngặt** trên `/api/auth/mfa/verify`: Tối đa **5 lần thử sai** trong vòng 15 phút.
  - Vượt quá 5 lần ➔ Khóa xác thực 2MFA trong **15 phút** (Lockout), trả về lỗi `HTTP 429 Too Many Requests`.
  - **Audit Log Cảnh báo:** Ghi vết mọi lần thử sai vào bảng `AuditLog` và tự động gửi thông báo Telegram cảnh báo cho Admin nếu có dấu hiệu tấn công bất thường.

---

### 📱 B. Quy Trình Khởi Tạo & Kích Hoạt 2MFA Lần Đầu (Google Authenticator)
1. Admin đăng nhập vào trang Cài đặt `/admin/settings` (hoặc màn hình Setup bắt buộc cho Admin mới).
2. Hệ thống tự động sinh một mã khóa bí mật duy nhất `mfaSecret` ngẫu nhiên bằng thư viện `otplib`.
3. Chuyển `mfaSecret` thành chuỗi URI theo chuẩn Google Authenticator (`otpauth://totp/MeowBack:admin@meowback.shop?secret=...`).
4. Dùng thư viện `qrcode` chuyển chuỗi này thành **Hình ảnh QR Code sắc nét**.
5. Admin mở ứng dụng Google Authenticator / Authy trên điện thoại ➔ Quét mã QR Code.
6. Admin nhập 1 mã 6 số chạy thử trên điện thoại ➔ Bấm **Xác nhận kích hoạt**.
---

### 🔑 E. Hướng Dẫn & Quy Định Sử Dụng 8 Mã Dự Phòng (Backup Codes)
1. **Mã dự phòng là gì?**
   - Khi bạn vừa bật xong 2MFA, hệ thống sẽ sinh ra **8 chuỗi mã ngẫu nhiên dạng 8 chữ số** (Ví dụ: `8492-1049`, `5912-3012`, `9481-2291`...).
   - Mỗi mã dự phòng đóng vai trò như một chiếc **chìa khóa phụ khẩn cấp** và chỉ dùng được **đúng 1 lần**. Sau khi dùng xong, mã đó sẽ bị hủy hiệu lực ngay lập tức.

2. **Dùng để làm gì và Sử dụng khi nào?**
   - Bạn sẽ dùng Mã dự phòng trong 3 tình huống khẩn cấp:
     - 📱 **Khi bị MẤT ĐIỆN THOẠI hoặc HỎNG ĐIỆN THOẠI:** Bạn không thể mở ứng dụng Google Authenticator để xem mã 6 số nhảy liên tục.
     - ✈️ **Khi đi NƯỚC NGOÀI hoặc vùng KHÔNG CÓ SÓNG / INTERNET:** Bạn không thể nhận được tin nhắn OTP Telegram hay SMS.
     - 🔄 **Khi ĐỔI ĐIỆN THOẠI MỚI:** Bạn chưa kịp chuyển dữ liệu Google Authenticator sang máy mới.

3. **Cách thức sử dụng thực tế:**
   - Tại màn hình yêu cầu nhập OTP 2MFA đăng nhập ➔ Nhập 1 trong 8 mã dự phòng bạn đã lưu vào ô nhập mã ➔ Bấm **Đăng nhập**.
   - Hệ thống xác minh mã đúng ➔ Cho phép bạn vào Admin ngay lập tức mà không cần điện thoại!

4. 💡 **Lời khuyên an toàn:**
   - Khi kích hoạt 2MFA xong, bạn nên tải file 8 mã này về máy, in ra giấy hoặc lưu vào ứng dụng ghi chú bảo mật (chỉ một mình bạn biết).

---

### 🔑 C. Cờ Quản Lý `mfa_enabled` Trong Bảng `User`
- Trong bảng `users`, cờ `mfa_enabled` mang 2 giá trị:
  - `false`: Admin chưa bật 2MFA. Khi đăng nhập thành công bằng Mật khẩu, hệ thống hiển thị Banner cảnh báo hoặc bắt buộc chuyển sang màn hình Setup 2MFA.
  - `true`: Admin đã bật 2MFA. Bắt buộc trải qua Bước 2 (Nhập OTP 6 số) mới được vào Admin.

---

### 📩 D. Cơ Chế Reset 2MFA Khi Mất Điện Thoại / Quên Mã OTP Qua Email
- **Tình huống:** Admin bị mất điện thoại, xóa ứng dụng Google Authenticator hoặc không có sẵn thiết bị ở màn hình nhập mã OTP.
- **Quy trình Khôi phục qua Email:**
  1. Tại màn hình nhập OTP 2MFA, bấm nút **"Quên mã 2MFA? Reset qua Email"**.
  2. Hệ thống gửi một Email có chứa **Secure Reset Link** kèm One-Time Token (thời hạn 15 phút) tới Email của Admin.
  3. Admin mở Email, click vào Link Reset.
  4. Hệ thống yêu cầu nhập lại **Mật khẩu hiện tại** để xác nhận chính chủ.
  5. Khi mật khẩu đúng ➔ Hệ thống lập tức vô hiệu hóa 2MFA (`mfa_enabled = false`), xóa `mfaSecret` cũ và cho phép Admin đăng nhập để cài đặt lại thiết bị mới.

---

## 2. 🔄 Luồng Đăng Nhập & Xác Thực 2MFA Hoàn Chỉnh

```
[ Giao Diện /login ]
        │
        ├─► Bước 1: Nhập Email & Mật Khẩu
        │       │
        │       ├─► Sai Mật Khẩu / Không phải Admin ──► Báo lỗi 401
        │       │
        │       └─► Đúng Mật Khẩu & Là Admin
        │               │
        │               ├─► Nếu mfa_enabled == false ──► Cấp Cookie & Yêu cầu Setup 2MFA
        │               │
        │               └─► Nếu mfa_enabled == true ──► Trả về { require2FA: true, mfaToken: "JWT_TEMP" }
        │
        └─► Bước 2: Chuyển sang Màn Hình Nhập Mã 2MFA (6 Chữ Số)
                │
                ├─► Option A: 🔑 Nhập mã từ Google Authenticator / Authy (TOTP)
                ├─► Option B: ✈️ Bấm nhận mã OTP gửi qua Telegram Bot Admin
                ├─► Option C: 🛡️ Nhập 1 trong 8 Mã Dự Phòng (Backup Code)
                ├─► Option D: 📩 Bấm "Quên mã 2MFA? Reset qua Email"
                │
                └─► Nhập mã 6 số ──► Gửi lên /api/auth/mfa/verify
                        │
                        ├─► Thử sai quá 5 lần ──► KHÓA 15 PHÚT (Rate limit 429) & Cảnh báo Telegram
                        │
                        └─► Đúng mã ──► Cấp Cookie Admin & Chuyển hướng tới /admin
```

---

## 3. 🗄️ Cập Nhật Cơ Sở Dữ Liệu (Database Schema)

Cập nhật Model `User` trong file `prisma/schema.prisma`:

```prisma
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  passwordHash          String    @map("password_hash")
  role                  String    @default("customer")
  fullName              String    @map("full_name")
  
  // ─── Các trường quản lý xác thực 2MFA ──────────────────────────
  mfaEnabled            Boolean   @default(false) @map("mfa_enabled")
  mfaSecret             String?   @map("mfa_secret")             // Khóa bí mật TOTP
  mfaMethod             String?   @default("totp") @map("mfa_method") // "totp" | "telegram" | "both"
  mfaBackupCodes        String?   @map("mfa_backup_codes")       // 8 Mã dự phòng (JSON array)
  mfaResetToken         String?   @map("mfa_reset_token")        // Token reset qua Email
  mfaResetExpiresAt     DateTime? @map("mfa_reset_expires_at")   // Thời hạn token reset
  
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@map("users")
}
```

---

## 4. 📦 Thư Viện Cần Cài Đặt

```bash
npm install otplib qrcode
npm install --save-dev @types/qrcode
```

---

## 5. 🛠️ Kế Hoạch Xây Dựng Danh Sách File Cần Thiết

### A. API Endpoints & Logic Core

1. **`lib/mfa.ts` (Tiện ích 2MFA Core)**:
   - `generateTotpSecret(email)`: Sinh secret key & QR code URL.
   - `verifyTotpCode(secret, code)`: Xác thực mã TOTP 6 số.
   - `generateBackupCodes()`: Sinh 8 mã dự phòng khẩn cấp.
   - `sendMfaResetEmail(email, resetToken)`: Gửi Mail chứa link Reset 2MFA.

2. **[MODIFY] `app/api/auth/login/route.ts`**:
   - Kiểm tra `user.mfaEnabled`. Nếu `true`, trả về `require2FA: true` kèm `mfaToken` tạm thời.

3. **[NEW] `app/api/auth/mfa/verify/route.ts`**:
   - Áp dụng `checkRateLimit("mfa_verify:ip:...", 5, 15 * 60 * 1000)`.
   - Nếu vượt quá 5 lần ➔ Khóa 15 phút & log `AuditLog`.
   - Kiểm tra mã TOTP / Backup Code ➔ Thành công cấp Session Cookie Admin.

4. **[NEW] `app/api/auth/mfa/reset-request/route.ts`**:
   - Nhận Email ➔ Gửi Link Reset 2MFA chứa token bí mật vào hòm thư.

5. **[NEW] `app/api/auth/mfa/reset-confirm/route.ts`**:
   - Nhận resetToken & password hiện tại ➔ Nếu đúng, set `mfaEnabled = false`, xóa secret ➔ Đăng xuất để đăng nhập lại.

6. **[NEW] `app/api/admin/mfa/setup/route.ts`**:
   - API cho trang Admin Settings: Khởi tạo QR Code, xác nhận mã 6 số và lưu `mfa_enabled = true`.

---

### B. Giao Diện Người Dùng (Frontend UI/UX)

1. **[MODIFY] `app/login/page.tsx`**:
   - Màn hình nhập OTP 6 số hiện đại với hiệu ứng gõ tự nhảy ô.
   - Nút **"Quên mã 2MFA? Reset qua Email"**.

2. **[NEW] `app/login/mfa-reset/page.tsx`**:
   - Màn hình xác nhận Reset 2MFA khi click từ Link Email.

3. **[NEW] `components/admin/AdminMfaSetupCard.tsx`**:
   - Card hiển thị trạng thái 2MFA (`mfa_enabled = true/false`), QR Code, mã dự phòng trong `/admin/settings`.

---

## 6. 🗓️ Lộ Trình Triển Khai (Roadmap)

- **Bước 1:** Cập nhật Schema DB (`mfa_enabled`, `mfa_secret`...) & Cài đặt `otplib`, `qrcode`.
- **Bước 2:** Xây dựng `lib/mfa.ts` & Rate limiter cho `/api/auth/mfa/verify`.
- **Bước 3:** Cập nhật API Login & Viết các API Verify, Setup, Reset qua Email.
- **Bước 4:** Thiết kế Giao diện UI Nhập OTP 6 số & Card Setup trong Admin Settings.
- **Bước 5:** Test giả lập Brute-force & Test khôi phục qua Email.
