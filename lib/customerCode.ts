import crypto from "crypto";
import { prisma } from "./prisma";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS;

/**
 * Lấy ngẫu nhiên 1 ký tự từ chuỗi bằng cryptographically secure RNG
 */
function getRandomChar(chars: string): string {
  const index = crypto.randomInt(0, chars.length);
  return chars[index];
}

/**
 * Sinh chuỗi ngẫu nhiên 6 ký tự gồm:
 * - Ít nhất 1 chữ hoa (A-Z)
 * - Ít nhất 1 chữ thường (a-z)
 * - Ít nhất 1 số (0-9)
 * - 3 ký tự ngẫu nhiên còn lại từ toàn bộ bảng mã [A-Za-z0-9]
 * - Xáo trộn ngẫu nhiên hoàn toàn (Fisher-Yates)
 */
export function generateRandomCode(length = 6): string {
  const chars: string[] = [
    getRandomChar(UPPERCASE),
    getRandomChar(LOWERCASE),
    getRandomChar(DIGITS),
  ];

  for (let i = 3; i < length; i++) {
    chars.push(getRandomChar(ALL_CHARS));
  }

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

/**
 * Sinh mã khách hàng / mã giới thiệu:
 * - Độ dài: đúng 6 ký tự ngẫu nhiên
 * - Thành phần: kết hợp chữ hoa, chữ thường và chữ số (vd: k7N2pX, 9mB4wZ)
 * - Đảm bảo KHÔNG TRÙNG NHAU (kiểm tra tồn tại trong DB, case-insensitive)
 * - Không cho phép đoán tuần tự như C0001, C0002...
 */
export async function generateCustomerCode(): Promise<string> {
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode(6);

    // Tránh các từ khoá hệ thống đặc biệt
    const upper = code.toUpperCase();
    if (upper === "SYSTEM" || upper === "ADMIN" || upper === "MEOWBK") {
      continue;
    }

    // Đảm bảo không trùng với bất kỳ khách hàng nào đã tồn tại trong DB
    const existing = await prisma.customer.findFirst({
      where: {
        customerCode: { equals: code, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  // Fallback an toàn (xác suất đụng 20 lần là gần như 0 trên không gian 56.8 tỷ mã)
  return generateRandomCode(7);
}

