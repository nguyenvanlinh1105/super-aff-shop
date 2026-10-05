import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

// PATCH /api/admin/admins/[id] — Chỉnh sửa thông tin tài khoản Admin
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID tài khoản" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing || existing.role !== "admin") {
      return NextResponse.json({ error: "Không tìm thấy tài khoản quản trị viên này" }, { status: 404 });
    }

    const body = await req.json();
    const { fullName, phone, telegramChatId, notifyOnNewCustomer, notifyOnImport, status, newPassword } = body;

    const dataToUpdate: any = {};

    if (fullName !== undefined) {
      if (typeof fullName !== "string" || fullName.trim().length === 0) {
        return NextResponse.json({ error: "Họ tên không được để trống" }, { status: 400 });
      }
      dataToUpdate.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      dataToUpdate.phone = phone ? phone.trim() : null;
    }

    if (telegramChatId !== undefined) {
      dataToUpdate.telegramChatId = telegramChatId ? telegramChatId.trim() : null;
    }

    if (notifyOnNewCustomer !== undefined) {
      dataToUpdate.notifyOnNewCustomer = Boolean(notifyOnNewCustomer);
    }

    if (notifyOnImport !== undefined) {
      dataToUpdate.notifyOnImport = Boolean(notifyOnImport);
    }

    if (status !== undefined) {
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
      }
      // Không cho phép tự khoá chính mình nếu chỉ có 1 admin duy nhất
      if (status === "inactive" && existing.id === session.userId) {
        const activeAdminsCount = await prisma.user.count({
          where: { role: "admin", status: "active" },
        });
        if (activeAdminsCount <= 1) {
          return NextResponse.json({ error: "Bạn là quản trị viên duy nhất đang hoạt động, không thể tự khoá tài khoản này." }, { status: 400 });
        }
      }
      dataToUpdate.status = status;
    }

    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json({ error: "Mật khẩu mới phải từ 6 ký tự trở lên" }, { status: 400 });
      }
      dataToUpdate.passwordHash = hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        telegramChatId: true,
        notifyOnNewCustomer: true,
        notifyOnImport: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      admin: updated,
      message: "Đã cập nhật thông tin quản trị viên thành công",
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/admins/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Lỗi khi cập nhật tài khoản Admin" }, { status: 500 });
  }
}

// DELETE /api/admin/admins/[id] — Từ chối xoá tài khoản theo yêu cầu bảo toàn dữ liệu
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(
    {
      error:
        "Hệ thống không hỗ trợ xoá tài khoản Admin để bảo toàn dữ liệu và lịch sử kiểm toán (Audit Logs). Vui lòng chuyển trạng thái sang Tạm khoá nếu không còn sử dụng.",
    },
    { status: 400 }
  );
}
