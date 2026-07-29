# Ghi chú nghiên cứu và rủi ro cần chốt

## 1. Những gì đã xác định được

- Bài toán affiliate hoàn tiền theo hướng bán tự động là phù hợp với dữ liệu yêu cầu.
- Điều kiện cốt lõi là phải có tracking ở cả lúc tạo link và lúc đối soát đơn.
- Zalo hiện có nhánh nền tảng Mini App công khai qua đường dẫn:
  - `https://mini.zalo.me/docs/api`
  - chuyển hướng sang `https://miniapp.zaloplatforms.com/docs/api`
- Vì tài liệu dev của Zalo không đọc đầy đủ trong môi trường hiện tại, các cam kết trong đề xuất được giữ ở mức an toàn: OA là hướng chính, nhóm Zalo là POC.

## 2. Những gì cần kiểm chứng bằng POC

- Tài khoản affiliate Shopee/TikTok có cho gắn `click_id/sub_id` hay biến tracking tương đương không.
- File export đơn hàng có trả đúng mã tracking đó không.
- OA hiện hỗ trợ các loại message, tần suất và quyền phản hồi nào cho use case này.
- Có thể chủ động gửi thông báo trạng thái đơn cho người dùng qua Zalo trong mọi trường hợp hay chỉ trong một số cửa sổ tương tác.
- Bot nhóm Zalo có thể triển khai bằng luồng chính thức hay phải dùng automation rủi ro cao.

## 3. Rủi ro nghiệp vụ

- Commission có thể đổi từ pending sang approved hoặc rejected.
- Đơn hủy, hoàn, đổi trả có thể làm thay đổi số tiền hoàn.
- Voucher chỉ tăng tỷ lệ chốt đơn, không thay thế vai trò affiliate link.

## 4. Cách nói chắc với khách

- Cam kết web và Zalo song song là hợp lý.
- Cam kết tracking + import + chia commission là hợp lý nếu có dữ liệu đối soát phù hợp.
- Không cam kết bot nhóm Zalo hay realtime trước khi POC xong.
