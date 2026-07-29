import { prisma } from "./prisma";

/**
 * Sinh mã khách hàng tiếp theo (C0001, C0002, ...).
 *
 * TRƯỚC ĐÂY dùng prisma.customer.count() + 1 — sai vì dựa vào SỐ LƯỢNG bản
 * ghi hiện có, không phải mã LỚN NHẤT đã từng cấp. Chỉ cần 1 khách bị xoá
 * (kể cả tài khoản test) là count() tụt xuống, sinh ra mã đã cấp cho ai đó
 * trước đó rồi — gây lỗi 500 "Unique constraint failed on customer_code"
 * ngay khi có khách đăng ký mới.
 *
 * Lấy MAX theo string DESC cũng không an toàn — hệ thống có khách đặc biệt
 * mã "SYSTEM" ("Link chia sẻ công khai"), và "SYSTEM" xếp sau mọi "C####"
 * theo alphabet (S > C) nên findFirst() sẽ chọn nhầm dòng đó, regex không
 * khớp, rơi về mặc định C0001 — đã tồn tại, và vì không có gì thay đổi giữa
 * các lần thử, retry cũng lặp lại y hệt lỗi. Phải lọc đúng định dạng C+số
 * rồi tính max bằng số thực sự, không dựa vào thứ tự sắp xếp chuỗi.
 */
export async function generateCustomerCode(): Promise<string> {
  const customers = await prisma.customer.findMany({
    where: { customerCode: { startsWith: "C" } },
    select: { customerCode: true },
  });

  let maxNumber = 0;
  for (const c of customers) {
    const match = c.customerCode.match(/^C(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNumber) maxNumber = n;
    }
  }

  return `C${String(maxNumber + 1).padStart(4, "0")}`;
}
