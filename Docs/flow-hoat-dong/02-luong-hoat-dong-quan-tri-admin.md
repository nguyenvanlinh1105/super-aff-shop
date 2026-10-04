# 📕 TÀI LIỆU HƯỚNG DẪN QUẢN TRỊ DÀNH CHO BAN QUẢN LÝ (ADMIN)
> **Dành cho:** Ban quản trị, chủ website, nhân viên vận hành, người quản lý không am hiểu kỹ thuật lập trình.  
> **Mục tiêu:** Nắm vững toàn bộ các chức năng quản lý, cách vận hành hệ thống hàng ngày, quy trình duyệt tiền và chăm sóc khách hàng một cách nhẹ nhàng, chính xác.

---

## 🏢 1. Vai trò của Admin là gì? (Hình dung trong thực tế)

Hãy tưởng tượng bạn đang mở một **"Trung tâm điều phối mua sắm thông minh"**:
- **Bên ngoài là các sàn lớn:** Shopee, TikTok Shop, Lazada... (nơi bán hàng và có sẵn quỹ tiền thưởng hoa hồng).
- **Bên trong là Khách hàng của bạn:** Những người thích mua sắm online và muốn tiết kiệm chi tiêu.
- **Vai trò của bạn (Admin):** 
  1. Giữ cho hệ thống luôn hoạt động trơn tru.
  2. Định kỳ lấy danh sách đơn hàng đã mua từ sàn về nạp vào trang web để hệ thống tự chia tiền thưởng cho khách.
  3. Khi khách có đủ tiền và bấm rút, bạn mở ứng dụng ngân hàng chuyển tiền cho khách và bấm xác nhận.
  4. Đăng tải các chương trình giảm giá, khuyến mãi hấp dẫn để thu hút khách hàng vào mua sắm nhiều hơn.

Mọi phép tính toán phức tạp (trừ thuế, chia phần trăm, cộng tiền vào ví, trừ tiền khi rút) **đều đã được hệ thống máy tính tự động làm thay bạn 100%**. Bạn chỉ cần nắm được quy trình và bấm các nút điều khiển.

---

## 🗺️ 2. Bản đồ các khu vực quản lý trong trang Admin

Khi đăng nhập vào tài khoản Admin, bạn sẽ thấy thanh menu bên trái dẫn tới các phòng ban quản lý như sau:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRANG QUẢN TRỊ ADMIN                            │
├────────────────────────────────────────────────────────────────────────┤
│ 1. 📊 Bảng điều khiển (Dashboard)  -> Xem tổng quan tiền bạc, đơn hàng │
│ 2. 👥 Khách hàng (Customers)       -> Danh sách người dùng, ví tiền    │
│ 3. 📦 Đơn hàng & Nạp báo cáo       -> Nạp đơn từ sàn, duyệt tiền hoàn  │
│ 4. 💳 Quản lý Rút tiền (Payments)  -> Xem yêu cầu rút, duyệt chuyển tiền│
│ 5. 🔗 Quản lý Link mua hàng        -> Xem các link khách đã tạo        │
│ 6. 🏷️ Quản lý Deal & Voucher       -> Đăng khuyến mãi, mã giảm giá hot │
│ 7. 💬 Kênh hỗ trợ & Thông báo      -> Telegram, Zalo, Chat trực tiếp   │
│ 8. ⚙️ Cài đặt hệ thống             -> Chỉnh % chia tiền, mức rút min   │
│ 9. 🔐 Bảo mật 2 lớp                -> Khóa bảo vệ tài khoản quản trị   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 3. Chi tiết từng chức năng quản lý & Cách vận hành

### 1. 📊 Bảng điều khiển tổng quan (Dashboard)
Đây là màn hình đầu tiên khi bạn vào trang Admin. Nó giống như một **"Bảng đồng hồ taplo của xe ô tô"**, giúp bạn nhìn thấy ngay tình hình hoạt động chỉ trong 5 giây:
- **Tổng khách hàng:** Hiện có bao nhiêu người đã đăng ký tài khoản.
- **Tổng số đơn hàng:** Số lượng đơn hàng đã được phát sinh từ đầu đến nay.
- **Tổng tiền sàn trả về (Doanh thu gộp):** Tổng khoản tiền thưởng mà các sàn Shopee/TikTok thanh toán cho hệ thống.
- **Tiền cần hoàn trả cho khách:** Số tiền thuộc về khách hàng (hệ thống chuẩn bị hoặc đã trả cho khách).
- **Lợi nhuận thực tế giữ lại:** Số tiền lãi ròng thuộc về bạn sau khi đã chia cho khách và trừ các chi phí giới thiệu.
- **Yêu cầu rút tiền đang chờ duyệt:** Chuông báo nhắc bạn có bao nhiêu khách hàng đang đợi nhận tiền chuyển khoản hôm nay.

---

### 2. 👥 Quản lý Khách hàng (Customers)
Nơi lưu trữ danh bạ toàn bộ người dùng đang tham gia mua sắm:
- **Thông tin cơ bản:** Xem họ tên, số điện thoại, email, tài khoản ngân hàng của khách.
- **Kiểm tra ví tiền của khách:** Bạn bấm vào bất kỳ khách nào đều biết rõ:
  - Khách này đã mua bao nhiêu đơn?
  - Trong ví đang có bao nhiêu tiền chờ duyệt? Bao nhiêu tiền có thể rút? Đã rút thành công bao nhiêu lần?
- **Khóa / Mở tài khoản:** Nếu phát hiện tài khoản nào có hành vi bất thường, quấy phá, bạn chỉ cần bấm nút "Khóa tài khoản" để ngừng quyền truy cập của họ.
- **Gắn cờ Đối tác VIP (Partner):** 
  - Khách thường: Khi giới thiệu bạn bè, chỉ được nhận hoa hồng trên 5 đơn đầu tiên của người bạn đó.
  - Đối tác VIP: Những cộng tác viên lớn, chuyên kéo đông khách cho bạn. Bạn có thể bật chức năng **"Đối tác VIP"** cho họ để họ được nhận hoa hồng vĩnh viễn không giới hạn đơn hàng.

---

### 3. 📦 Quản lý Đơn hàng & Quy trình "Nạp báo cáo từ sàn" (Cực kỳ quan trọng)

Đây là nghiệp vụ quan trọng nhất mà Admin cần làm định kỳ (thường là hàng tuần hoặc sau các đợt siêu sale của Shopee):

#### ❓ Tại sao phải nạp báo cáo?
Các sàn thương mại điện tử như Shopee/TikTok không báo ngay lập tức từng đồng tiền cho từng trang web riêng lẻ vì lý do bảo mật và chống bom hàng. Thay vào đó, định kỳ sàn sẽ kết xuất ra một **bảng danh sách (file Excel hoặc CSV)** chứa toàn bộ các đơn hàng đã được giao thành công và có phát sinh hoa hồng.

#### 🛠️ Các bước nạp báo cáo đơn hàng (Chỉ mất 2 phút):
1. **Bước 1:** Đăng nhập vào trang đối tác của Shopee (Shopee Affiliate) hoặc TikTok Shop -> Tải bảng báo cáo đơn hàng (file định dạng Excel/CSV) về máy tính của bạn.
2. **Bước 2:** Vào trang Admin MeowBack -> Chọn mục **"Đơn hàng"** -> Bấm nút **"Nạp file báo cáo mới" (Import file)**.
3. **Bước 3:** Kéo thả file vừa tải vào ô nạp và bấm **"Bắt đầu xử lý"**.
4. **Bước 4 (Hệ thống tự động làm việc):** 
   - Máy tính sẽ đọc từng dòng trong bảng: Nhìn thấy mã đánh dấu của ai, nó sẽ tự động cộng đơn hàng đó cho người đó.
   - Máy tính tự động tính toán thuế, tự động trích 80% đưa vào mục "Tiền chờ duyệt" của khách, và trích phần thưởng cho người giới thiệu (nếu có).
5. **Bước 5 (Xử lý đơn chưa nhận diện được - nếu có):**
   - Đôi khi có những đơn hàng bị sót mã do khách bấm nhầm hoặc lỗi mạng. Hệ thống sẽ gom vào mục **"Đơn chưa gán khách"**.
   - Nếu khách hàng nhắn tin hỏi kèm mã đơn hàng trên Shopee, bạn chỉ cần tìm mã đó và bấm **"Gán đơn này cho khách..."**, tiền sẽ lập tức được cộng cho khách.

---

### 4. 💳 Quản lý Rút tiền (Payments - Chi trả tiền mặt cho khách)

Đây là nơi thực hiện lời hứa uy tín với khách hàng:

```
[Khách bấm Rút tiền trên web]
              ⬇️
[Hệ thống tạo yêu cầu chờ duyệt trong Admin]
              ⬇️
[Admin mở App Ngân hàng trên điện thoại -> Chuyển tiền cho khách]
              ⬇️
[Admin bấm "Xác nhận đã chuyển" + Tải ảnh chụp biên lai bill lên web]
              ⬇️
[Hệ thống tự trừ tiền trong ví khách -> Báo "Đã thanh toán" thành công]
```

#### Chi tiết cách duyệt rút tiền:
1. Vào mục **"Thanh toán / Rút tiền"**. Bạn sẽ thấy danh sách những người đang xếp hàng chờ rút tiền.
2. Bấm vào một yêu cầu rút tiền, bạn sẽ thấy rõ:
   - Tên khách hàng.
   - Tên ngân hàng (ví dụ: Vietcombank, Vietinbank, MB...).
   - Số tài khoản ngân hàng & Tên chủ tài khoản.
   - Số tiền cần chuyển (ví dụ: 150.000 VNĐ).
3. Bạn mở ứng dụng ngân hàng trên điện thoại cá nhân của bạn, thực hiện **chuyển khoản nhanh 24/7** đúng số tiền và thông tin đó cho khách.
4. Chụp lại màn hình điện thoại biên lai chuyển tiền thành công.
5. Trên web Admin, bạn bấm nút **"Xác nhận đã thanh toán"**, điền mã giao dịch và tải bức ảnh biên lai vừa chụp lên.
6. **Xong!** Hệ thống sẽ tự động trừ số dư trong ví của khách, chuyển trạng thái thành "Đã chi trả" và gửi thông báo chúc mừng đến khách.

---

### 5. 💰 Cơ chế Phân chia tiền thưởng (Dòng tiền chạy thế nào?)

Mọi người thường tò mò: *Hệ thống tính tiền và sinh lời như thế nào?*  
Hãy cùng xem một bài toán thực tế cực kỳ dễ hiểu:

> **Giả sử:** Trong tháng này, sàn Shopee tổng kết và trả khoản tiền thưởng cho các đơn hàng của bạn là **10.000.000 VNĐ**.

```
Tổng tiền thưởng sàn thông báo: 10.000.000đ
   │
   ├── ➖ Trừ thuế thu nhập theo luật (10.98%): 1.098.000đ nộp cho nhà nước
   │
   └── 💰 Số tiền thực nhận về tài khoản: 8.902.000đ
         │
         ├── 🟢 80% Hoàn trả cho Khách hàng: 7.121.600đ
         │     (Chia đều vào ví của các khách đã mua hàng)
         │
         └── 🔵 20% Giữ lại cho Hệ thống của bạn: 1.780.400đ
               │
               ├── Trích thưởng Giới thiệu bạn bè (nếu có, tối đa 5%): ~445.000đ
               └── 💵 Lợi nhuận ròng của Admin: ~1.335.400đ
```

*Tất cả tỷ lệ phần trăm này (80%, 20%, 5%, thuế 10.98%) bạn hoàn toàn có thể tùy ý điều chỉnh lại trong phần Cài đặt bất cứ lúc nào!*

---

### 6. 🏷️ Quản lý Deal hời & Voucher khuyến mãi
Để giữ chân khách hàng thường xuyên ghé thăm web, bạn có thể tự tay đăng các chương trình khuyến mãi:
- **Đăng Deal giảm giá hot:** 
  - Bạn lướt Shopee thấy một chiếc tai nghe Bluetooth đang đại hạ giá từ 300k xuống 99k.
  - Bạn vào mục **"Quản lý Deal"** -> Bấm **"Thêm Deal mới"**.
  - Nhập tên sản phẩm, giá cũ, giá mới, dán link sản phẩm Shopee vào.
  - Hệ thống sẽ tự động làm sạch đường link và biến nó thành link hoàn tiền của web bạn, rồi hiển thị đẹp mắt lên trang chủ để mọi người vào xem và bấm mua ngay.
- **Đăng Mã giảm giá (Vouchers):**
  - Đăng các mã giảm 15k, 30k, 50k của sàn để khách hàng dễ dàng lưu mã trước khi đi chợ.

---

### 7. 💬 Kênh hỗ trợ & Kết nối khách hàng
- **Phòng chat cộng đồng:** Bạn có thể tham gia nhắn tin trò chuyện trực tiếp cùng tất cả các thành viên trong hệ thống để tạo không khí mua sắm sôi nổi.
- **Quản lý Bot Telegram & Zalo:**
  - Cấu hình thông báo tự động: Mỗi khi có khách mới đăng ký, có đơn hàng mới phát sinh hoặc có khách gửi yêu cầu rút tiền, tin nhắn sẽ tự động "ting ting" về điện thoại của Admin để bạn không bỏ lỡ.
  - Cung cấp đường dẫn nhóm Zalo để hỗ trợ những khách hàng cần trợ giúp nhanh.

---

### 8. ⚙️ Cài đặt hệ thống & Cấu hình tỷ lệ
Nơi thiết lập các "luật chơi" của trang web:
- **Tỷ lệ hoàn tiền cho khách:** Đang đặt mặc định là 80% (bạn có thể đổi thành 75%, 85% tùy chiến lược kinh doanh).
- **Tỷ lệ giữ lại của hệ thống:** Đang đặt mặc định là 20%.
- **Tỷ lệ thưởng giới thiệu bạn bè:** Thưởng 5% cho người giới thiệu.
- **Mức rút tiền tối thiểu:** Đặt mặc định là 50.000 VNĐ (để tránh việc khách yêu cầu rút vài nghìn đồng khiến bạn mất công chuyển khoản nhiều lần).

---

### 9. 🔐 Bảo mật 2 lớp cho tài khoản Admin (Chống hacker)
Vì tài khoản Admin là nơi quản lý tiền bạc và danh sách khách hàng, trang bị bảo mật 2 lớp là điều tối quan trọng:
- Ngoài mật khẩu thông thường, khi bạn đăng nhập, hệ thống sẽ yêu cầu thêm một **Mã số gồm 6 chữ số đổi mới liên tục mỗi 30 giây** trên ứng dụng điện thoại (như ứng dụng Google Authenticator).
- Nhờ vậy, ngay cả khi kẻ gian biết được mật khẩu chữ của bạn, họ cũng **hoàn toàn không thể đăng nhập được** vì không cầm chiếc điện thoại của bạn trên tay.

---

## 📅 4. Lịch biểu làm việc mẫu một ngày của Admin

Để việc quản lý nhẹ nhàng và không bị áp lực, bạn chỉ cần dành ra khoảng **15 - 30 phút mỗi ngày** theo lịch sau:

| Thời điểm | Công việc Admin cần làm | Thời gian ước tính |
| :--- | :--- | :--- |
| ☀️ **Buổi sáng (9:00)** | - Mở Dashboard xem số đơn hàng mới phát sinh hôm qua.<br>- Mở mục **"Rút tiền"**: Xem có khách nào yêu cầu rút tiền không -> Chuyển khoản và up ảnh bill xác nhận. | 10 - 15 phút |
| 🌤️ **Buổi trưa (12:00)** | - Vào mục **"Deal hot"**: Đăng 2 - 3 sản phẩm đang có giá hời trong ngày lên trang chủ để kích thích khách bấm mua. | 5 - 10 phút |
| 📅 **Hàng tuần (Thứ Hai)** | - Đăng nhập sàn Shopee/TikTok tải file báo cáo đơn hàng tuần qua.<br>- Bấm nút nạp file vào hệ thống để máy tự động chia tiền hoàn cho khách. | 5 phút |
| 🌙 **Bất cứ khi nào rảnh** | - Trả lời thắc mắc của khách qua kênh Zalo hoặc phòng chat nếu có ai cần trợ giúp. | Tùy nhu cầu |

---

## 💡 5. Hướng dẫn xử lý một số tình huống thường gặp

#### Tình huống 1: Khách nhắn tin bảo *"Tôi vừa mua hàng xong sao không thấy đơn trên web?"*
> **Cách xử lý:** Bạn giải thích nhẹ nhàng cho khách rằng: Sàn Shopee/TikTok cần thời gian đóng gói, vận chuyển và hoàn tất đơn hàng. Sau khi khách nhận hàng và không đổi trả, hệ thống nạp báo cáo từ sàn thì đơn sẽ tự động hiển thị trong tài khoản của khách.

#### Tình huống 2: Khách điền sai số tài khoản ngân hàng khi bấm rút tiền
> **Cách xử lý:** Khi bạn dùng app ngân hàng chuyển khoản, app ngân hàng sẽ báo "Tên người nhận không khớp" hoặc "Không tìm thấy số tài khoản". Bạn chỉ cần bấm "Từ chối yêu cầu rút tiền" trên web kèm lời nhắn: *"Vui lòng kiểm tra lại số tài khoản ngân hàng"*. Tiền sẽ được hoàn trả lại ví của khách để khách nhập lại cho đúng.

#### Tình huống 3: Có đơn hàng trong báo cáo nhưng không rõ của khách nào
> **Cách xử lý:** Nếu có khách gửi tin nhắn khiếu nại kèm mã đơn hàng thực tế trên Shopee, bạn vào mục **"Đơn hàng chưa gán"**, gõ tìm mã đơn đó và bấm nút gán về đúng tên của vị khách đó. Khách sẽ nhận được tiền ngay và rất hài lòng vì sự hỗ trợ tận tâm của bạn.
