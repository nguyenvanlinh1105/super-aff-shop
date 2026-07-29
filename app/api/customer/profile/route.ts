import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const updateData: any = {};
    if (data.bankName !== undefined) updateData.bankName = data.bankName;
    if (data.bankAccountNumber !== undefined) updateData.bankAccountNumber = data.bankAccountNumber;
    if (data.bankAccountName !== undefined) updateData.bankAccountName = data.bankAccountName;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const customer = await prisma.customer.update({
      where: { id: session.customerId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      customer: {
        bankName: customer.bankName,
        bankAccountNumber: customer.bankAccountNumber,
        bankAccountName: customer.bankAccountName,
        phone: customer.phone,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
