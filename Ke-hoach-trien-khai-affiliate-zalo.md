# Kế hoạch triển khai website affiliate hoàn tiền tích hợp Zalo

## 1. Kết luận nhanh

Mô hình này khả thi nếu chốt theo hướng bán tự động ở giai đoạn đầu:

- Người dùng gửi link Shopee/TikTok.
- Hệ thống chuyển thành link affiliate của chủ hệ thống.
- Hệ thống gắn mã tracking riêng cho từng lượt tạo link.
- Admin định kỳ import file đơn hàng từ dashboard affiliate để đối soát.
- Hệ thống tính hoàn tiền 80/20.
- Admin chuyển khoản thủ công và đánh dấu đã thanh toán.

Điều kiện quan trọng nhất:

- Link affiliate phải gắn được `click_id`, `sub_id` hoặc mã tracking tương đương.
- File đối soát đơn hàng phải trả về đúng mã tracking đó.

Nếu thiếu một trong hai điều kiện trên thì phần đối soát tự động sẽ giảm mạnh, phải chuyển sang xử lý thủ công.

## 2. Đánh giá độ khả thi

### Phần khả thi cao

- Website admin quản lý khách hàng, link, đơn hàng, hoàn tiền.
- Form/webhook nhận link sản phẩm từ web hoặc Zalo OA.
- Sinh link affiliate có gắn tracking riêng.
- Lưu lịch sử link theo khách hàng.
- Import Excel/CSV đơn hàng.
- Map đơn hàng về khách nếu file có tracking.
- Tính commission và chia 80/20.
- Theo dõi công nợ và lịch sử thanh toán thủ công.

### Phần khả thi trung bình, cần POC trước

- Tự động lấy voucher/deal nếu nguồn cấp không ổn định hoặc không có API chuẩn.
- Tích hợp Zalo OA để nhận link và trả link tự động theo template hoặc luồng chat cho phép.
- Tạo trải nghiệm khách hàng ngay trong Zalo Mini App.

### Phần rủi ro cao, không nên cam kết ngay

- Bot đọc và trả lời trực tiếp trong nhóm Zalo.
- Nhận đơn realtime nếu network affiliate không có API hoặc postback.
- Tự map đơn chính xác khi báo cáo đơn không có `click_id/sub_id`.

## 3. Kiến trúc đề xuất

### Kênh nhận link

- Web form công khai.
- Zalo Official Account.
- Tùy chọn sau: Zalo Mini App.

### Backend

- API xử lý link đầu vào.
- Dịch vụ chuẩn hóa link Shopee/TikTok.
- Dịch vụ tạo link affiliate và gắn tracking.
- Dịch vụ import đối soát đơn hàng.
- Dịch vụ tính hoa hồng, ví hoàn tiền, lịch sử thanh toán.
- Job định kỳ để gửi thông báo hoặc tổng hợp báo cáo.

### Admin

- Dashboard tổng quan.
- Quản lý khách hàng.
- Quản lý link đã tạo.
- Kho voucher/mã giảm giá.
- Import file đơn hàng.
- Danh sách đơn chờ duyệt, đã duyệt, bị hủy.
- Danh sách khách chờ thanh toán.
- Báo cáo doanh thu và lợi nhuận.

## 4. Module bắt buộc của MVP

### Khách hàng

- Họ tên, số điện thoại, Zalo ID, trạng thái hoạt động.
- Tổng hoa hồng phát sinh.
- Tổng đã hoàn, chưa hoàn, đã thanh toán.

### Link affiliate

- Link gốc.
- Nền tảng.
- Link đã chuyển đổi.
- Tracking code.
- Người tạo.
- Thời gian tạo.
- Trạng thái.

### Voucher

- Nền tảng.
- Tên chương trình.
- Mã giảm giá hoặc link voucher.
- Nội dung ưu đãi.
- Thời gian hiệu lực.
- Trạng thái hiển thị.

### Đơn hàng và commission

- Order ID.
- Tracking code.
- Nền tảng.
- Khách hàng sở hữu.
- Commission gốc.
- Tiền khách nhận.
- Tiền hệ thống giữ.
- Trạng thái đơn.
- Trạng thái thanh toán.
- Dữ liệu gốc từ file import.

### Thanh toán thủ công

- Phiếu thanh toán.
- Người nhận.
- Số tiền.
- Ngày thanh toán.
- Mã giao dịch.
- Ảnh bill.
- Ghi chú.

## 5. Tích hợp Zalo nên làm thế nào

### Phương án nên chốt trước

Zalo OA là hướng an toàn nhất cho giai đoạn đầu:

- Người dùng nhắn link vào OA.
- OA đẩy sự kiện về backend qua webhook.
- Backend nhận diện link, tạo affiliate link, gắn tracking, chọn voucher phù hợp.
- Hệ thống trả lại link đã chuyển đổi và hướng dẫn bấm link trước khi mua.

### Phương án mở rộng tốt

Zalo Mini App phù hợp khi cần:

- Form nhập link đẹp hơn.
- Xem lịch sử link đã tạo.
- Xem số dư hoàn tiền.
- Xem đơn đã ghi nhận và lịch sử thanh toán.

### Phương án chỉ nên POC

Bot đọc nhóm Zalo:

- Không nên cam kết như một tính năng chính ngay từ đầu.
- Nếu khách bắt buộc cần, chỉ nên làm POC kỹ thuật riêng.
- POC phải kiểm tra ổn định, giới hạn nền tảng, rủi ro khóa luồng hoặc phụ thuộc automation ngoài chuẩn.

## 6. Quy trình vận hành đề xuất

### Luồng người dùng

1. Người dùng gửi link sản phẩm.
2. Hệ thống tạo link affiliate có tracking.
3. Hệ thống trả link và voucher liên quan.
4. Người dùng mua hàng qua link đó.
5. Admin định kỳ tải file đơn từ dashboard affiliate.
6. Admin import file vào web.
7. Hệ thống map đơn theo tracking và tính 80/20.
8. Admin chuyển khoản thủ công.
9. Admin đánh dấu đã thanh toán.

### Luồng admin hằng ngày

1. Kiểm tra link mới phát sinh.
2. Cập nhật voucher mới.
3. Import file đơn hàng.
4. Kiểm tra các dòng lỗi hoặc không map được.
5. Duyệt danh sách cần thanh toán.
6. Chuyển khoản và cập nhật trạng thái.

## 7. Lộ trình triển khai

### Giai đoạn 0 - POC kỹ thuật

Mục tiêu:

- Xác minh có tạo được link affiliate từ link sản phẩm thật.
- Xác minh có gắn được tracking.
- Xác minh file đơn hàng có trả tracking.
- Xác minh kênh Zalo OA nhận và trả link ổn định.

Đầu ra:

- Tài liệu kết quả test.
- Kết luận phạm vi MVP.

### Giai đoạn 1 - MVP vận hành thật

Bao gồm:

- Admin web.
- Quản lý khách hàng.
- Chuyển link affiliate.
- Quản lý tracking.
- Kho voucher.
- Import Excel/CSV.
- Đối soát đơn và chia 80/20.
- Quản lý thanh toán thủ công.
- Báo cáo cơ bản.

### Giai đoạn 2 - Tối ưu vận hành

- Trang khách hàng tự tra cứu.
- Thông báo Zalo khi đơn được ghi nhận hoặc thanh toán.
- Khiếu nại đơn chưa ghi nhận.
- Cảnh báo đơn bất thường.

### Giai đoạn 3 - Tự động hóa sâu hơn

- Tích hợp postback/API nếu affiliate network hỗ trợ.
- Đồng bộ đơn gần realtime.
- Mini App hoàn chỉnh hoặc PWA cho khách hàng.

## 8. Ước lượng thời gian tương đối

Nếu chốt phạm vi MVP gọn:

- POC kỹ thuật: 5 đến 10 ngày làm việc.
- Thiết kế và chốt dữ liệu: 3 đến 5 ngày.
- MVP admin + backend + import đối soát: 4 đến 6 tuần.
- Tích hợp Zalo OA cơ bản: 3 đến 7 ngày nếu policy và tài khoản sẵn sàng.
- UAT và tinh chỉnh quy trình vận hành: 1 đến 2 tuần.

Tổng thời gian thực tế hợp lý cho MVP:

- Khoảng 6 đến 8 tuần.

## 9. Stack đề xuất

### Nhanh để triển khai

- Frontend: Next.js.
- Backend: Next.js API hoặc NestJS.
- Database: PostgreSQL.
- Queue/job: Redis + BullMQ hoặc cron đơn giản giai đoạn đầu.
- Storage: S3-compatible cho bill chuyển khoản và file import.
- Auth admin: email/password + 2FA nếu cần.

### Lý do chọn

- Dễ làm dashboard và form nhập liệu.
- Dễ triển khai webhook Zalo.
- Dễ xử lý import file Excel/CSV.
- Dễ mở rộng sang portal khách hàng sau này.

## 10. Rủi ro cần chốt với khách

- Không có API thì không có realtime thực sự.
- Không có tracking trong link và file thì không thể đối soát tự động chính xác.
- Bot nhóm Zalo không nên bán như một cam kết cứng ngay từ đầu.
- Commission có thể thay đổi trạng thái do hủy đơn, hoàn đơn, từ chối ghi nhận.
- Voucher hỗ trợ chốt đơn nhưng không thay thế vai trò của affiliate link.

## 11. Khuyến nghị chốt dự án

Nên bán theo 2 bước:

1. POC kiểm chứng tracking + file đối soát + Zalo OA.
2. Nếu POC đạt, triển khai MVP bán tự động trong 6 đến 8 tuần.

Không nên nhận cam kết ngay cho:

- Bot đọc nhóm Zalo.
- Đối soát realtime.
- Tự map đơn khi không có tracking.
