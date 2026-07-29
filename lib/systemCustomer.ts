import { prisma } from "./prisma";

export const SYSTEM_CUSTOMER_CODE = "SYSTEM";

// Khách hàng giả dùng để gắn các link công khai (voucher, deal) không thuộc
// về một khách hàng thật cụ thể — nhờ đó vẫn tạo được TrackingLink có
// trackingCode hợp lệ, để đối soát CSV Shopee (map theo sub_id) tìm thấy và
// không rơi vào "chưa map".
export async function getSystemCustomer() {
  return prisma.customer.upsert({
    where: { customerCode: SYSTEM_CUSTOMER_CODE },
    update: {},
    create: {
      customerCode: SYSTEM_CUSTOMER_CODE,
      fullName: "Link chia sẻ công khai",
      status: "active",
      note: "Khach he thong dung de gan link uu dai/deal cong khai, khong phai khach hang that.",
    },
  });
}
