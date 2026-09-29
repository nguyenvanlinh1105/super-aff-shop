import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; simulated: boolean; error?: string }> {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || "MeowBack Hoan Tien";
  const fromAddress = process.env.SMTP_USER;

  if (!transporter || !fromAddress) {
    // Chưa cấu hình SMTP — không throw, chỉ báo simulated để không làm hỏng
    // luồng chính (giống pattern notifyCustomerTelegram best-effort).
    return { ok: true, simulated: true, error: "SMTP chưa được cấu hình" };
  }

  try {
    const attachments: Array<{ filename: string; path: string; cid: string }> = [];
    const logoPath = path.join(process.cwd(), "public", "icon-192.png");
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "meowback-logo.png",
        path: logoPath,
        cid: "meowback-logo",
      });
    }

    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments,
    });
    return { ok: true, simulated: false };
  } catch (error) {
    return {
      ok: false,
      simulated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const BRAND_COLOR = "#FF6D9E";
const BRAND_DARK = "#E85A8A";
const BRAND_GRADIENT = "linear-gradient(135deg, #FF6D9E 0%, #FF4D82 100%)";

function emailShell(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MeowBack Email</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F5F7;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.04);border:1px solid #EAECEF;">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg, #FF6D9E 0%, #FF8FB1 50%, #FF4D82 100%);padding:0;margin:0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding:28px 24px 20px;text-align:center;background:#ffffff;border-bottom:1px solid #F3F4F6;">
              <div style="margin-bottom:8px;">
                <img src="cid:meowback-logo" alt="MeowBack Logo" width="56" height="56" style="width:56px;height:56px;border-radius:14px;display:inline-block;vertical-align:middle;box-shadow:0 4px 14px rgba(255,109,158,0.22);border:1px solid rgba(255,109,158,0.15);" />
              </div>
              <div style="font-size:22px;font-weight:900;color:#111827;letter-spacing:-0.3px;">MeowBack</div>
              <div style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;margin-top:4px;">Nền tảng mua sắm hoàn tiền thông minh</div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:28px 28px 24px;background:#ffffff;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;background:#FAFAFB;text-align:center;border-top:1px solid #F3F4F6;">
              <div style="font-size:13px;font-weight:800;margin-bottom:4px;">
                <a href="https://meowback.shop" style="color:${BRAND_COLOR};text-decoration:none;">meowback.shop</a>
              </div>
              <div style="font-size:12px;color:#9CA3AF;line-height:1.5;">Đây là email bảo mật tự động từ MeowBack · Vui lòng không trả lời thư này.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function buildPasswordResetEmail(params: { fullName: string; resetUrl: string; expiresInMinutes: number }): string {
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;letter-spacing:-0.2px;">Đặt lại mật khẩu</h1>
    <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4B5563;">
      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản MeowBack của bạn. Vui lòng bấm nút bên dưới để tiến hành tạo mật khẩu mới:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
      <tr>
        <td align="center" style="border-radius:12px;background:${BRAND_GRADIENT};box-shadow:0 4px 16px rgba(255,109,158,0.3);">
          <a href="${params.resetUrl}" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
            Đặt lại mật khẩu
          </a>
        </td>
      </tr>
    </table>
    <div style="margin:24px 0 0;padding:14px 16px;background:#F9FAFB;border-radius:12px;border:1px solid #F3F4F6;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;">
        Liên kết này có hiệu lực trong <strong>${params.expiresInMinutes} phút</strong>.<br />
        Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email để giữ an toàn cho tài khoản.
      </p>
    </div>
  `);
}

export function buildPinResetEmail(params: { fullName: string; otp: string; expiresInMinutes?: number }): string {
  const expireMin = params.expiresInMinutes ?? 5;
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;letter-spacing:-0.2px;">Đặt lại mã PIN rút tiền</h1>
    <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4B5563;">
      Bạn vừa yêu cầu cấp lại mã PIN bảo mật cho tài khoản của bạn. Sử dụng mã xác thực bên dưới để hoàn tất việc đặt lại mã PIN:
    </p>
    
    <div style="background:#FFF5F8;border:2px dashed #FF6D9E;border-radius:16px;padding:24px 16px;text-align:center;margin:20px 0;">
      <div style="font-size:11px;font-weight:800;color:${BRAND_DARK};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Mã xác thực OTP (6 chữ số)</div>
      <div style="font-size:36px;font-weight:900;color:#111827;letter-spacing:10px;font-family:'SF Mono',Consolas,Monaco,monospace;line-height:1;">${escapeHtml(params.otp)}</div>
    </div>

    <div style="margin:20px 0 0;padding:14px 16px;background:#F9FAFB;border-radius:12px;border:1px solid #F3F4F6;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;">
        Mã xác thực có hiệu lực trong <strong>${expireMin} phút</strong>.<br />
        Tuyệt đối không chia sẻ mã này cho bất kỳ ai để đảm bảo an toàn cho tài khoản.
      </p>
    </div>
  `);
}

export function buildPasswordChangedEmail(params: { fullName: string }): string {
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;letter-spacing:-0.2px;">Mật khẩu đã được thay đổi</h1>
    <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <div style="margin:16px 0;padding:14px 16px;background:#F0FDF4;border-radius:12px;border:1px solid #BBF7D0;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#166534;font-weight:700;">
        Mật khẩu tài khoản MeowBack của bạn vừa được thay đổi thành công.
      </p>
    </div>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
      Nếu bạn không thực hiện thay đổi này, hãy liên hệ ngay với bộ phận hỗ trợ của chúng tôi để được trợ giúp bảo vệ tài khoản kịp thời.
    </p>
  `);
}

export function buildPinChangedEmail(params: { fullName: string }): string {
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;letter-spacing:-0.2px;">Mã PIN rút tiền đã được thay đổi</h1>
    <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <div style="margin:16px 0;padding:14px 16px;background:#F0FDF4;border-radius:12px;border:1px solid #BBF7D0;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#166534;font-weight:700;">
        Mã PIN rút tiền 6 chữ số của bạn vừa được thay đổi thành công.
      </p>
    </div>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
      Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với bộ phận hỗ trợ MeowBack để khóa giao dịch bảo vệ số dư.
    </p>
  `);
}

export function buildAdminWithdrawRequestEmail(params: {
  customerName: string;
  customerCode: string;
  amount: number;
}): string {
  const amountText = new Intl.NumberFormat("vi-VN").format(Math.round(params.amount)) + "đ";
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;">Khách yêu cầu rút tiền</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#374151;">
      Khách hàng <strong>${escapeHtml(params.customerName)}</strong> (<code>${escapeHtml(params.customerCode)}</code>) vừa gửi yêu cầu rút tiền.
    </p>
    <p style="margin:0 0 20px;font-size:28px;font-weight:900;color:${BRAND_COLOR};">${amountText}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
      Vào trang Admin → Thanh toán để xem chi tiết và tạo phiếu duyệt.
    </p>
  `);
}

export function buildAdminNewRegistrationEmail(params: {
  fullName: string;
  email: string;
  customerCode: string;
  phone?: string | null;
  source: "email" | "google";
  referredByCode?: string | null;
  referrerName?: string | null;
  referrerEmail?: string | null;
}): string {
  const sourceLabel = params.source === "google" ? "Đăng ký qua Google" : "Đăng ký qua Email";
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;">Khách hàng mới đăng ký</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;font-size:13px;color:#374151;">
      <tr>
        <td style="padding:6px 0;color:#6B7280;">Họ tên</td>
        <td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.fullName)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6B7280;">Email</td>
        <td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.email)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6B7280;">Mã khách hàng</td>
        <td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.customerCode)}</td>
      </tr>
      ${
        params.phone
          ? `<tr><td style="padding:6px 0;color:#6B7280;">Điện thoại</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.phone)}</td></tr>`
          : ""
      }
      <tr>
        <td style="padding:6px 0;color:#6B7280;">Nguồn</td>
        <td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${sourceLabel}</td>
      </tr>
      ${
        params.referredByCode
          ? `<tr><td style="padding:6px 0;color:#6B7280;">Được giới thiệu bởi</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.referrerName ?? "")}${params.referrerName ? " — " : ""}${escapeHtml(params.referredByCode)}</td></tr>
             ${
               params.referrerEmail
                 ? `<tr><td style="padding:6px 0;color:#6B7280;">Email người giới thiệu</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.referrerEmail)}</td></tr>`
                 : ""
             }`
          : ""
      }
    </table>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
      Vào trang Admin → Khách hàng để xem chi tiết.
    </p>
  `);
}

export function buildCustomerWithdrawRequestEmail(params: {
  fullName: string;
  amount: number;
  bankName?: string | null;
  bankAccountNumber?: string | null;
}): string {
  const amountText = new Intl.NumberFormat("vi-VN").format(Math.round(params.amount)) + "đ";
  const maskedAccount = params.bankAccountNumber
    ? "•••• " + params.bankAccountNumber.slice(-4)
    : null;
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;">Yêu cầu rút tiền vừa được tạo</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4B5563;">
      Chúng tôi vừa ghi nhận một yêu cầu rút tiền từ tài khoản của bạn:
    </p>
    <p style="margin:0 0 16px;font-size:28px;font-weight:900;color:${BRAND_COLOR};">${amountText}</p>
    ${
      params.bankName || maskedAccount
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;font-size:13px;color:#374151;">
            ${
              params.bankName
                ? `<tr><td style="padding:6px 0;color:#6B7280;">Ngân hàng</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.bankName)}</td></tr>`
                : ""
            }
            ${
              maskedAccount
                ? `<tr><td style="padding:6px 0;color:#6B7280;">Tài khoản nhận</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(maskedAccount)}</td></tr>`
                : ""
            }
          </table>`
        : ""
    }
    <div style="margin:0 0 8px;padding:14px 16px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#991b1b;">
        Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ hỗ trợ ngay lập tức để chúng tôi tạm khóa giao dịch bảo vệ số dư.
      </p>
    </div>
  `);
}

export function buildPaymentSentEmail(params: {
  fullName: string;
  amount: number;
  paymentCode: string;
  bankAccountNumber?: string | null;
  transferReference?: string | null;
}): string {
  const amountText = new Intl.NumberFormat("vi-VN").format(Math.round(params.amount)) + "đ";
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;">Chuyển tiền hoàn thành công</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4B5563;">
      Chúng tôi vừa chuyển khoản thành công số tiền hoàn của bạn:
    </p>
    <p style="margin:0 0 20px;font-size:28px;font-weight:900;color:${BRAND_COLOR};">${amountText}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;font-size:13px;color:#374151;">
      <tr>
        <td style="padding:6px 0;color:#6B7280;">Mã phiếu</td>
        <td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.paymentCode)}</td>
      </tr>
      ${
        params.bankAccountNumber
          ? `<tr><td style="padding:6px 0;color:#6B7280;">Tài khoản nhận</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.bankAccountNumber)}</td></tr>`
          : ""
      }
      ${
        params.transferReference
          ? `<tr><td style="padding:6px 0;color:#6B7280;">Mã giao dịch</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#111827;">${escapeHtml(params.transferReference)}</td></tr>`
          : ""
      }
    </table>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;">
      Cảm ơn bạn đã đồng hành cùng MeowBack. Tiền sẽ cập nhật vào tài khoản ngân hàng của bạn trong ít phút.
    </p>
  `);
}

export function buildAccountCreatedByAdminEmail(params: {
  fullName: string;
  setPasswordUrl: string;
  expiresInDays: number;
}): string {
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;letter-spacing:-0.2px;">Tài khoản của bạn đã sẵn sàng</h1>
    <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4B5563;">
      Quản trị viên vừa tạo tài khoản MeowBack cho bạn. Vui lòng bấm nút bên dưới để đặt mật khẩu và bắt đầu sử dụng:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
      <tr>
        <td align="center" style="border-radius:12px;background:${BRAND_GRADIENT};box-shadow:0 4px 16px rgba(255,109,158,0.3);">
          <a href="${params.setPasswordUrl}" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
            Đặt mật khẩu
          </a>
        </td>
      </tr>
    </table>
    <div style="margin:24px 0 0;padding:14px 16px;background:#F9FAFB;border-radius:12px;border:1px solid #F3F4F6;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;">
        Liên kết kích hoạt này có hiệu lực trong <strong>${params.expiresInDays} ngày</strong>.
      </p>
    </div>
  `);
}

export function buildReferralSuccessEmail(params: { referrerName: string; friendName: string }): string {
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;">Lời mời thành viên thành công</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#374151;">Xin chào <strong>${escapeHtml(params.referrerName)}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4B5563;">
      <strong>${escapeHtml(params.friendName)}</strong> vừa đăng ký tài khoản MeowBack bằng link giới thiệu của bạn.
      Khi bạn ấy hoàn tất đơn hàng đầu tiên và được duyệt, hoa hồng giới thiệu sẽ tự động cộng vào ví của bạn.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
      Xem chi tiết tại mục "Mời bạn bè" trên meowback.shop.
    </p>
  `);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
