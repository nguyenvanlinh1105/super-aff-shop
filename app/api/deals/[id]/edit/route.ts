import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { saveOptimizedImage } from "@/lib/imageUpload";

// POST: cập nhật deal kèm upload ảnh mới (admin only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const originalPrice = formData.get("originalPrice") as string | null;
  const salePrice = formData.get("salePrice") as string | null;
  const discountPercent = formData.get("discountPercent") as string | null;
  const category = formData.get("category") as string | null;
  const linkType = formData.get("linkType") as string | null;
  const expiresAt = formData.get("expiresAt") as string | null;
  const imageFile = formData.get("image") as File | null;

  let uploadedImageUrl: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    uploadedImageUrl = await saveOptimizedImage(imageFile, "deals");
  }

  const numOrig = originalPrice ? parseFloat(originalPrice) : null;
  const numSale = salePrice ? parseFloat(salePrice) : null;
  let finalDiscount = discountPercent ? parseInt(discountPercent) : null;
  if (finalDiscount === null && numOrig && numSale && numOrig > numSale) {
    finalDiscount = Math.round(((numOrig - numSale) / numOrig) * 100);
  }

  const deal = await prisma.dealPost.update({
    where: { id: params.id },
    data: {
      title,
      description: description || null,
      originalPrice: numOrig,
      salePrice: numSale,
      discountPercent: finalDiscount,
      category: category || null,
      ...(linkType ? { linkType } : {}),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      ...(uploadedImageUrl ? { uploadedImageUrl } : {}),
    },
  });

  return NextResponse.json({ deal });
}
