import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const MAX_WIDTH = 1000;
const JPEG_QUALITY = 80;

/**
 * Resize + nén ảnh trước khi lưu — ảnh upload từ điện thoại/máy tính thường
 * vài MB, không cần thiết cho ảnh thẻ deal chỉ hiển thị vài trăm px. Luôn
 * xuất ra .jpg để nén nhất quán, không phụ thuộc định dạng gốc.
 */
export async function saveOptimizedImage(file: File, subDir: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
  await mkdir(uploadDir, { recursive: true });

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer)
    .rotate() // tôn trọng EXIF orientation trước khi resize
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const filename = `${randomUUID()}.jpg`;
  await writeFile(path.join(uploadDir, filename), outputBuffer);
  return `/uploads/${subDir}/${filename}`;
}
