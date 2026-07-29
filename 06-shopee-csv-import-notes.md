# Ghi chú import CSV Shopee affiliate

## File CSV đã kiểm tra

File mẫu đang có trong workspace:

- [AffiliateCommissionReport_202607111337.csv](AffiliateCommissionReport_202607111337.csv)

Kết quả đọc file thực tế:

- Header có đúng 47 cột.
- Tên cột khớp với mô tả nghiệp vụ.
- `Kênh` trong file mẫu hiện trả về giá trị `Zalo`.
- `Sub_id1` đến `Sub_id5` trong file mẫu hiện đang trống.

## Quy ước map khi import

- `externalOrderId` = `ID đơn hàng`
- `checkoutId` = `Checkout id`
- `orderStatus` = `Trạng thái đặt hàng`
- `orderedAt` = `Thời Gian Đặt Hàng`
- `completedAt` = `Thời gian hoàn thành`
- `clickedAt` = `Thời gian Click`
- `shopName` = `Tên Shop`
- `shopId` = `Shop id`
- `itemId` = `Item id`
- `itemName` = `Tên Item`
- `orderAmount` = `Giá trị đơn hàng (₫)`
- `grossCommission` = `Tổng hoa hồng đơn hàng(₫)`
- `netCommission` = `Hoa hồng ròng tiếp thị liên kết(₫)`
- `productAffiliateStatus` = `Trạng thái sản phẩm liên kết`
- `subId1` = `Sub_id1`
- `subId2` = `Sub_id2`
- `subId3` = `Sub_id3`
- `subId4` = `Sub_id4`
- `subId5` = `Sub_id5`
- `channel` = `Kênh`

## Quy ước tracking nên dùng

Để import tự map khách hàng chuẩn, nên tạo link affiliate với:

- `Sub_id1` = mã khách hàng
- `Sub_id2` = mã link hoặc tracking code
- `Sub_id3` = nguồn tạo link, ví dụ `WEB` hoặc `ZALO`
- `Sub_id4` = campaign / nhóm / phân loại chiến dịch
- `Sub_id5` = dự phòng

Hệ thống đã được chỉnh theo hướng này trong:

- [lib/tracking.ts](lib/tracking.ts)
- [lib/linkConversion.ts](lib/linkConversion.ts)
- [lib/shopeeAffiliateCsv.ts](lib/shopeeAffiliateCsv.ts)

## Công thức chia hoa hồng

- `customerCashbackAmount = netCommission * 0.8`
- `ownerProfitAmount = netCommission * 0.2`

Ví dụ dòng mẫu:

- `netCommission = 77109.2`
- `customerCashbackAmount = 61687.36`
- `ownerProfitAmount = 15421.84`
