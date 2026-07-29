import { prisma } from "./prisma";

const SHORT_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const DEFAULT_SHORT_CODE_LENGTH = 7;

function randomShortCode(length = DEFAULT_SHORT_CODE_LENGTH): string {
  let result = "";
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * SHORT_CODE_ALPHABET.length);
    result += SHORT_CODE_ALPHABET[randomIndex];
  }
  return result;
}

export async function generateShortCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const shortCode = randomShortCode();
    const existing = await prisma.trackingLink.findUnique({
      where: { shortCode },
      select: { id: true },
    });

    if (!existing) return shortCode;
  }

  throw new Error("Khong tao duoc short code duy nhat");
}

export function buildShortUrl(shortCode: string): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${appUrl}/go/${shortCode}`;
}
