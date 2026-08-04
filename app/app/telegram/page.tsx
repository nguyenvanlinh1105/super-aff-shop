import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TelegramLinkCard } from "@/components/customer/TelegramLinkCard";

export default async function CustomerTelegramPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  return (
    <div className="flex w-full flex-col gap-xl pb-2xl">
      <div className="flex items-center gap-md">
        <img src="/meowback_lucky_cat_logo.png" alt="" className="h-14 w-14 shrink-0 object-contain" />
        <div>
          <h1 className="display-sm text-ink">Liên kết Telegram</h1>
          <p className="mt-xs text-[14px] text-mute leading-relaxed">
            Đồng bộ tài khoản Telegram của bạn để kiểm tra số dư, đơn hàng và nhận thông báo hoàn tiền ngay
            trong Telegram.
          </p>
        </div>
      </div>

      <TelegramLinkCard />
    </div>
  );
}
