# Đề xuất triển khai hệ thống affiliate hoàn tiền chạy song song Web và Zalo

## 1. Mục tiêu chốt

Hệ thống phải chạy song song trên 2 kênh:

- Web: để chủ hệ thống chủ động vào đổi link theo nhu cầu.
- Zalo: để người dùng gửi link và nhận lại link affiliate ngay trong luồng chat.

Hai kênh này không được tách riêng. Cả web và Zalo phải dùng chung:

- Backend xử lý link.
- Cơ chế tracking.
- Dữ liệu khách hàng.
- Dữ liệu đơn hàng.
- Công thức tính hoàn tiền.

## 2. Kết luận khả thi

### Khả thi cao và nên cam kết

- Web đổi link theo nhu cầu.
- Web admin quản lý khách hàng, link, voucher, đơn hàng, thanh toán.
- Zalo OA nhận link và trả link affiliate.
- Dùng một backend chung cho web và Zalo.
- Import Excel/CSV từ dashboard affiliate để đối soát.
- Tính hoàn tiền 80/20 và quản lý thanh toán thủ công.

### Khả thi có điều kiện

- Trả voucher/mã giảm giá tự động nếu có nguồn dữ liệu ổn định.
- Zalo Mini App để khách xem lịch sử link, đơn, số dư.
- Gửi thông báo trạng thái đơn hoặc thanh toán qua Zalo.

### Không nên cam kết ngay

- Bot đọc và phản hồi trực tiếp trong nhóm Zalo.
- Đồng bộ đơn hàng realtime nếu network affiliate không có API hoặc postback.
- Tự map chính xác đơn hàng nếu file đối soát không có `click_id`, `sub_id` hoặc mã tracking tương đương.

## 3. Điều kiện kỹ thuật bắt buộc

Hệ thống chỉ vận hành chuẩn khi có đủ 2 điều kiện:

1. Link affiliate tạo ra phải gắn được mã tracking riêng theo từng lần tạo link.
2. File đối soát đơn hàng phải trả về đúng mã tracking đó.

Nếu thiếu điều kiện 1:

- Hệ thống vẫn đổi link được.
- Nhưng không tách chính xác đơn hàng thuộc về khách nào.

Nếu thiếu điều kiện 2:

- Hệ thống vẫn lưu lịch sử link.
- Nhưng phần commission và hoàn tiền phải đối soát tay.

## 4. Chiến lược triển khai chắc chắn khả thi

### Giai đoạn 0 - POC xác minh

Mục tiêu là xác minh các điểm sống còn trước khi cam kết MVP đầy đủ:

- Test tài khoản affiliate Shopee/TikTok đang dùng.
- Test tạo link affiliate từ link sản phẩm thật.
- Test gắn `click_id` hoặc `sub_id`.
- Kiểm tra file báo cáo đơn hàng có trả tracking hay không.
- Test luồng Zalo OA gửi link vào và nhận link ra.

Kết quả POC sẽ chia dự án thành 2 nhánh:

- Nhánh A: có tracking đầy đủ -> triển khai MVP bán tự động chuẩn.
- Nhánh B: không có tracking đầy đủ -> vẫn làm được nhưng thiên về hỗ trợ thao tác và đối soát tay.

### Giai đoạn 1 - MVP vận hành thật

MVP nên bao gồm:

- Web đổi link nhanh.
- Web admin.
- Backend trung tâm.
- Zalo OA nhận link và trả link.
- Quản lý voucher.
- Import CSV/Excel.
- Tính commission.
- Danh sách công nợ và lịch sử thanh toán.

### Giai đoạn 2 - Tối ưu vận hành

- Portal khách hàng.
- Zalo Mini App.
- Thông báo trạng thái đơn.
- Khiếu nại đơn chưa ghi nhận.
- Cảnh báo đơn bất thường.

## 5. Khuyến nghị chốt với khách

Nên chốt theo câu này:

"Hệ thống sẽ chạy đồng thời trên web và Zalo, dùng chung một backend trung tâm. Web phục vụ thao tác đổi link theo nhu cầu và quản trị vận hành; Zalo phục vụ luồng khách gửi link và nhận link lại nhanh. Giai đoạn đầu triển khai theo mô hình bán tự động để đảm bảo chắc chắn khả thi, với điều kiện tiên quyết là hệ thống affiliate phải gắn và đối soát được tracking."

## 6. Thời gian triển khai đề xuất

Nếu POC đạt:

- POC: 5 đến 10 ngày làm việc.
- Thiết kế chi tiết và chốt dữ liệu: 3 đến 5 ngày.
- MVP: 4 đến 6 tuần.
- UAT và tinh chỉnh: 1 đến 2 tuần.

Tổng thời gian hợp lý:

- Khoảng 6 đến 8 tuần.

## 7. Stack đề xuất

- Frontend web: Next.js
- Backend: Next.js API hoặc NestJS
- Database: PostgreSQL
- Storage file: S3-compatible
- Job queue: Redis + BullMQ hoặc cron ở giai đoạn đầu
- Auth admin: email/password + 2FA

## 8. Nghiên cứu tham chiếu

Các điểm dưới đây được dùng để định hướng đề xuất:

- Zalo có nền tảng Mini App chính thức và được dẫn từ `mini.zalo.me/docs/api` sang `miniapp.zaloplatforms.com/docs/api`.
- Tài liệu dev của Zalo trong môi trường hiện tại không trích xuất đầy đủ nội dung, nên chỉ chốt chắc phần cần POC thay vì cam kết quá mức.
- Tài liệu yêu cầu gốc của bài toán đã xác định rất rõ mô hình bán tự động, import file đối soát, và vai trò sống còn của `click_id/sub_id`.

## 9. Kết luận cuối

Phương án chắc chắn khả thi nhất là:

- Web và Zalo chạy song song từ đầu.
- Dùng một backend trung tâm.
- Lấy Zalo OA làm kênh chat chính thức.
- Coi bot nhóm Zalo là POC riêng.
- Coi đối soát bằng file import là cơ chế chuẩn nếu chưa có API/postback.
