import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./password";

const MAX_PIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 phút

/** Validate PIN format: exactly 6 digits */
export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

type VerifyPinResult =
  | { ok: true }
  | { ok: false; code: "no_pin" | "locked" | "wrong_pin"; error: string; lockMinutes?: number };

/**
 * Verify a customer's payment PIN.
 * Handles brute-force protection: locks after MAX_PIN_ATTEMPTS failures.
 */
export async function verifyPaymentPin(customerId: string, pin: string): Promise<VerifyPinResult> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { paymentPin: true, pinFailedAttempts: true, pinLockUntil: true },
  });

  if (!customer) {
    return { ok: false, code: "no_pin", error: "Không tìm thấy tài khoản" };
  }

  if (!customer.paymentPin) {
    return { ok: false, code: "no_pin", error: "Bạn chưa thiết lập mã PIN rút tiền" };
  }

  // Check if locked
  if (customer.pinLockUntil && customer.pinLockUntil > new Date()) {
    const remainMs = customer.pinLockUntil.getTime() - Date.now();
    const remainMin = Math.ceil(remainMs / 60000);
    return {
      ok: false,
      code: "locked",
      error: `Mã PIN đã bị khoá do nhập sai quá ${MAX_PIN_ATTEMPTS} lần. Vui lòng thử lại sau ${remainMin} phút hoặc đặt lại PIN qua Email.`,
      lockMinutes: remainMin,
    };
  }

  // Verify PIN
  const match = verifyPassword(pin, customer.paymentPin);

  if (!match) {
    const newAttempts = customer.pinFailedAttempts + 1;
    const updateData: any = { pinFailedAttempts: newAttempts };

    if (newAttempts >= MAX_PIN_ATTEMPTS) {
      updateData.pinLockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
    });

    const remaining = MAX_PIN_ATTEMPTS - newAttempts;

    if (remaining <= 0) {
      return {
        ok: false,
        code: "locked",
        error: `Mã PIN đã bị khoá do nhập sai quá ${MAX_PIN_ATTEMPTS} lần. Vui lòng thử lại sau 30 phút hoặc đặt lại PIN qua Email.`,
        lockMinutes: 30,
      };
    }

    return {
      ok: false,
      code: "wrong_pin",
      error: `Mã PIN không đúng. Còn ${remaining} lần thử trước khi bị khoá.`,
    };
  }

  // PIN correct — reset failed attempts
  if (customer.pinFailedAttempts > 0 || customer.pinLockUntil) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { pinFailedAttempts: 0, pinLockUntil: null },
    });
  }

  return { ok: true };
}

/** Hash and save a new payment PIN */
export async function setPaymentPin(customerId: string, pin: string) {
  const hashed = hashPassword(pin);
  await prisma.customer.update({
    where: { id: customerId },
    data: { paymentPin: hashed, pinFailedAttempts: 0, pinLockUntil: null },
  });
}

/** Generate a random 6-digit OTP */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
