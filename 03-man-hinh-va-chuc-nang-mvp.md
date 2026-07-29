# Danh sách màn hình và chức năng MVP

## 1. Màn hình đổi link nhanh

### Mục tiêu

- Cho phép bạn vào web và đổi link ngay theo nhu cầu.

### Chức năng

- Nhập link Shopee/TikTok.
- Chọn khách hàng hoặc nhận diện người thao tác.
- Chọn kênh tạo link: web hoặc Zalo.
- Tạo link affiliate.
- Hiển thị tracking code.
- Gợi ý voucher áp dụng được.
- Sao chép link nhanh.
- Xem lịch sử các link vừa tạo.

## 2. Dashboard tổng quan

### Chỉ số chính

- Tổng khách hàng.
- Tổng link đã tạo.
- Tổng số đơn.
- Tổng commission.
- Tổng tiền cần hoàn cho khách.
- Tổng tiền hệ thống giữ lại.
- Tổng tiền đã thanh toán.
- Số đơn lỗi hoặc chưa map được.

## 3. Quản lý khách hàng

### Danh sách

- Họ tên.
- Số điện thoại.
- Zalo ID.
- Mã khách hàng.
- Tổng commission.
- Tổng tiền được hoàn.
- Tổng đã trả.
- Công nợ còn lại.
- Trạng thái hoạt động.

### Thao tác

- Tạo mới.
- Sửa thông tin.
- Khóa/mở khách hàng.
- Xem lịch sử link.
- Xem lịch sử đơn.
- Xem lịch sử thanh toán.

## 4. Quản lý link đã tạo

### Danh sách

- Thời gian tạo.
- Khách hàng.
- Nền tảng.
- Link gốc.
- Link affiliate.
- Tracking code.
- Kênh tạo.
- Trạng thái.

### Thao tác

- Tìm kiếm.
- Lọc theo ngày, khách, nền tảng, kênh.
- Copy link.
- Xem chi tiết.

## 5. Quản lý voucher/mã giảm giá

### Danh sách

- Nền tảng.
- Tên chương trình.
- Mã voucher.
- Link voucher.
- Nội dung ưu đãi.
- Thời gian hiệu lực.
- Trạng thái.

### Thao tác

- Tạo mới.
- Import danh sách voucher.
- Bật/tắt hiển thị.
- Gắn voucher ưu tiên theo nền tảng hoặc chiến dịch.

## 6. Import đối soát đơn hàng

### Màn hình upload

- Upload Excel/CSV.
- Chọn nguồn file.
- Preview dữ liệu.
- Map cột.

### Màn hình kết quả import

- Tổng số dòng.
- Số dòng import thành công.
- Số dòng trùng.
- Số dòng không map được.
- Số dòng lỗi format.

### Thao tác

- Tải file lỗi.
- Gán tay đơn chưa map được.
- Import lại.

## 7. Quản lý đơn hàng

### Danh sách

- Order ID.
- Khách hàng.
- Nền tảng.
- Tracking code.
- Giá trị đơn.
- Commission.
- Tiền hoàn cho khách.
- Tiền hệ thống giữ lại.
- Trạng thái đơn.
- Trạng thái thanh toán.
- Nguồn dữ liệu.

### Thao tác

- Tìm kiếm theo order ID.
- Lọc theo trạng thái.
- Duyệt hoặc cập nhật trạng thái.
- Gán tay khách hàng nếu cần.
- Xem raw import.

## 8. Danh sách thanh toán

### Mục tiêu

- Gom các khoản cần trả cho từng khách.

### Hiển thị

- Tên khách.
- Số tiền đang chờ thanh toán.
- Số đơn liên quan.
- Kỳ thanh toán.
- Trạng thái.

### Thao tác

- Tạo phiếu thanh toán.
- Đánh dấu đã chuyển khoản.
- Nhập mã giao dịch.
- Upload bill.
- Ghi chú.

## 9. Báo cáo

### Báo cáo chính

- Commission theo ngày/tháng.
- Hoàn tiền theo ngày/tháng.
- Lợi nhuận hệ thống theo ngày/tháng.
- Top khách hàng.
- Tỷ lệ đơn approved/rejected/canceled.
- Tỷ lệ đơn không map được.

## 10. Trang tích hợp Zalo

### Mục tiêu

- Quản lý cấu hình OA và theo dõi hoạt động từ Zalo.

### Chức năng

- Lưu thông tin OA.
- Cấu hình webhook endpoint.
- Bật/tắt auto reply.
- Xem log tin nhắn vào.
- Xem log phản hồi ra.
- Theo dõi lỗi xử lý webhook.

## 11. Trang cấu hình hệ thống

### Chức năng

- Cấu hình tỷ lệ commission chia khách/hệ thống.
- Cấu hình format tracking code.
- Cấu hình rule map voucher.
- Cấu hình kỳ thanh toán.
- Cấu hình user admin và phân quyền.

## 12. Phạm vi ngoài MVP

- Bot đọc nhóm Zalo.
- App mobile riêng.
- Postback realtime.
- Tự động lấy voucher từ nguồn ngoài.
- Tự động bank qua cổng ngân hàng.
