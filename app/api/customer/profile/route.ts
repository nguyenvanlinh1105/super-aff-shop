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
    if (data.fullName !== undefined) {
      if (typeof data.fullName !== "string" || data.fullName.length > 100 || data.fullName.trim() === "") {
        return NextResponse.json({ error: "Họ và tên không hợp lệ hoặc quá dài" }, { status: 400 });
      }
      updateData.fullName = data.fullName.trim();
    }
    if (data.address !== undefined) {
      if (typeof data.address !== "string" || data.address.length > 255) {
        return NextResponse.json({ error: "Địa chỉ không hợp lệ hoặc quá dài" }, { status: 400 });
      }
      updateData.address = data.address.trim();
    }
    if (data.bankName !== undefined) {
      if (typeof data.bankName !== "string" || data.bankName.length > 100) {
        return NextResponse.json({ error: "Tên ngân hàng không hợp lệ hoặc quá dài" }, { status: 400 });
      }
      updateData.bankName = data.bankName.trim();
    }
    if (data.bankAccountNumber !== undefined) {
      if (typeof data.bankAccountNumber !== "string" || data.bankAccountNumber.length > 50 || !/^[0-9a-zA-Z]+$/.test(data.bankAccountNumber)) {
        return NextResponse.json({ error: "Số tài khoản không hợp lệ (chỉ chứa chữ số và chữ cái, tối đa 50 ký tự)" }, { status: 400 });
      }
      updateData.bankAccountNumber = data.bankAccountNumber.trim();
    }
    if (data.bankAccountName !== undefined) {
      if (typeof data.bankAccountName !== "string" || data.bankAccountName.length > 100) {
        return NextResponse.json({ error: "Tên chủ tài khoản không hợp lệ hoặc quá dài" }, { status: 400 });
      }
      updateData.bankAccountName = data.bankAccountName.trim().toUpperCase();
    }
    if (data.phone !== undefined) {
      if (typeof data.phone !== "string" || data.phone.length > 20 || !/^[0-9+\s()-]+$/.test(data.phone)) {
        return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
      }
      updateData.phone = data.phone.trim();
    }

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
        fullName: customer.fullName,
        address: customer.address,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
