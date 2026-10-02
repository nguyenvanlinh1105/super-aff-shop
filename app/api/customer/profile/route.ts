import { NextResponse } from "next/server";
import { getSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCustomerCode } from "@/lib/customerCode";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thực hiện thao tác này" }, { status: 401 });
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
    if (data.bankAccountNumber !== undefined && data.bankAccountNumber !== "") {
      const cleanAcc = data.bankAccountNumber.trim().replace(/[\s-]/g, "");
      if (!/^\d{6,20}$/.test(cleanAcc)) {
        return NextResponse.json({ error: "Số tài khoản không hợp lệ (phải từ 6 đến 20 chữ số và không chứa chữ cái)" }, { status: 400 });
      }
      updateData.bankAccountNumber = cleanAcc;
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

    // Tìm customer hiện tại theo session.customerId
    let targetCustomerId = session.customerId;
    let customer = targetCustomerId
      ? await prisma.customer.findUnique({ where: { id: targetCustomerId } })
      : null;

    // Nếu không tìm thấy theo session.customerId, tìm theo User trong DB để tự động đồng bộ
    if (!customer) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { customer: true },
      });

      if (!dbUser) {
        clearSessionCookie();
        return NextResponse.json(
          { error: "Tài khoản không tồn tại trên hệ thống. Vui lòng đăng nhập lại." },
          { status: 401 }
        );
      }

      if (dbUser.customer) {
        customer = dbUser.customer;
        targetCustomerId = customer.id;
        await setSessionCookie({
          userId: dbUser.id,
          role: dbUser.role as "admin" | "customer",
          fullName: dbUser.fullName,
          customerId: customer.id,
        });
      } else {
        // Tạo mới hồ sơ Customer cho User nếu chưa có
        const customerCode = await generateCustomerCode();
        customer = await prisma.customer.create({
          data: {
            customerCode,
            fullName: dbUser.fullName,
            phone: updateData.phone ?? null,
          },
        });
        targetCustomerId = customer.id;
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { customerId: customer.id },
        });
        await setSessionCookie({
          userId: dbUser.id,
          role: dbUser.role as "admin" | "customer",
          fullName: dbUser.fullName,
          customerId: customer.id,
        });
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: targetCustomerId! },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      customer: {
        bankName: updatedCustomer.bankName,
        bankAccountNumber: updatedCustomer.bankAccountNumber,
        bankAccountName: updatedCustomer.bankAccountName,
        phone: updatedCustomer.phone,
        fullName: updatedCustomer.fullName,
        address: updatedCustomer.address,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Không thể cập nhật hồ sơ, vui lòng thử lại sau" }, { status: 500 });
  }
}
