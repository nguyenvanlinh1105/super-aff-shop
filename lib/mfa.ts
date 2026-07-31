import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

export async function generateTotpSecret(email: string) {
  const secret = generateSecret();
  const serviceName = "MeowBack Admin";
  const otpauth = generateURI({
    secret,
    label: email,
    issuer: serviceName,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  return {
    secret,
    otpauth,
    qrCodeDataUrl,
  };
}

export function verifyTotpCode(secret: string, token: string): boolean {
  try {
    const cleanToken = token.replace(/\s+/g, "");
    const result = verifySync({
      token: cleanToken,
      secret,
    });
    return result.valid;
  } catch {
    return false;
  }
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formatted = `${rand.slice(0, 4)}-${rand.slice(4, 8)}`;
    codes.push(formatted);
  }
  return codes;
}

export function verifyBackupCode(
  storedJson: string | null | undefined,
  inputCode: string
): { valid: boolean; remainingCodes: string[] } {
  if (!storedJson) return { valid: false, remainingCodes: [] };

  try {
    const codes: string[] = JSON.parse(storedJson);
    const cleanInput = inputCode.trim().toUpperCase();
    const index = codes.indexOf(cleanInput);

    if (index !== -1) {
      const remainingCodes = codes.filter((_, i) => i !== index);
      return { valid: true, remainingCodes };
    }
  } catch (e) {
    console.error(e);
  }

  return { valid: false, remainingCodes: [] };
}
