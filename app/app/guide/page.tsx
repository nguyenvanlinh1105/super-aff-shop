import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const steps = [
  {
    title: "Dán link sản phẩm",
    body: "Vào mục Hoàn tiền, dán link Shopee/TikTok bạn muốn mua, chọn nền tảng và bấm Đổi link.",
  },
  {
    title: "Bấm vào link vừa tạo",
    body: "Luôn bấm vào link hoàn tiền hệ thống trả về trước khi mua hàng để đơn được ghi nhận đúng.",
  },
  {
    title: "Hoàn tất mua hàng",
    body: "Thanh toán bình thường trên Shopee/TikTok như mọi khi.",
  },
  {
    title: "Chờ đối soát",
    body: "Định kỳ hệ thống đối soát đơn hàng từ sàn — đơn chỉ được xác nhận \"Tiền đã về\" khi Shopee/TikTok đánh dấu trạng thái sản phẩm liên kết là \"Hoàn thành\", không phải chỉ đơn giản là đơn hàng giao thành công.",
  },
  {
    title: "Nhận hoàn tiền",
    body: "Khi đơn được duyệt (tiền đã về), số tiền hoàn sẽ hiện trong Ví tiền của bạn và được thanh toán theo kỳ.",
  },
];

const notes = [
  {
    title: "Luôn bấm lại link mỗi lần mua",
    body: "Mỗi lượt mua hàng cần bấm lại link hoàn tiền ngay trước khi vào Shopee/TikTok. Nếu đã tắt trình duyệt hoặc mở lại app sau đó, link theo dõi có thể hết hiệu lực và đơn sẽ không được ghi nhận.",
  },
  {
    title: "Không dùng thêm app/link hoàn tiền khác",
    body: "Shopee chỉ tính hoa hồng cho lượt click gần nhất trước khi đặt hàng. Nếu bạn bấm thêm link từ ứng dụng hoàn tiền khác, mã giảm giá ngoài hệ thống, hoặc link chia sẻ từ người khác sau khi đã bấm link của MeowBack, đơn sẽ bị tính cho nguồn khác.",
  },
  {
    title: "Hoàn tất đơn trong phiên, không thoát giữa chừng",
    body: "Sau khi bấm link, nên hoàn tất đặt hàng trong cùng phiên truy cập. Thoát ứng dụng, tắt wifi hoặc chuyển sang app khác giữa lúc chuyển hướng có thể khiến Shopee không ghi nhận được nguồn click.",
  },
  {
    title: "Một số ngành hàng không được tính hoa hồng",
    body: "Shopee/TikTok loại trừ hoa hồng với: nạp thẻ điện thoại, Shopee Xu/Ví, vé máy bay, một số sản phẩm Mall/Brand đặc biệt. Những đơn này vẫn lên hệ thống nhưng sẽ không có tiền hoàn.",
  },
  {
    title: "Đơn có thể bị huỷ hoa hồng ngay cả khi đã \"đã về\"",
    body: "Nếu sau đó bạn đổi trả hàng, huỷ đơn, hoặc Shopee phát hiện gian lận, hoa hồng đã ghi nhận có thể bị thu hồi (clawback) — số tiền tương ứng sẽ được trừ lại khỏi ví nếu chưa thanh toán.",
  },
  {
    title: "Thời gian đối soát thường mất 7–20 ngày",
    body: "Shopee/TikTok chỉ xác nhận hoa hồng sau khi hết thời hạn đổi trả của đơn hàng. Đơn ở trạng thái \"Chờ xác nhận\" là bình thường, không phải lỗi hệ thống — cứ chờ đến kỳ đối soát tiếp theo.",
  },
];

export default function CustomerGuidePage() {
  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader title="Hướng dẫn sử dụng" subtitle="5 bước đơn giản để bắt đầu nhận hoàn tiền." />

      <div className="flex flex-col">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-lg">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-ink">
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-canvas-soft" />}
            </div>
            <Card variant="soft" className="mb-lg w-full">
              <h2 className="display-xs mb-sm">{s.title}</h2>
              <p className="text-body">{s.body}</p>
            </Card>
          </div>
        ))}
      </div>

      {/* Lưu ý quan trọng */}
      <div className="flex flex-col gap-lg">
        <div className="flex items-center gap-sm">
          <img src="/heothongbao.png" alt="" className="h-9 w-9 object-contain" />
          <div>
            <h2 className="display-xs">Lưu ý quan trọng để chắc chắn được hoàn tiền</h2>
            <p className="text-[13px] text-mute">Đọc kỹ trước khi mua — tránh mất tiền hoàn vì những lỗi rất dễ gặp.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
          {notes.map((n) => (
            <div key={n.title} className="flex items-start gap-md rounded-2xl bg-amber-50 border border-amber-100 p-lg">
              <AlertTriangle size={18} className="mt-[2px] shrink-0 text-amber-500" />
              <div>
                <h3 className="text-[14px] font-bold text-amber-900 mb-1">{n.title}</h3>
                <p className="text-[13px] text-amber-700 leading-relaxed">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA hỗ trợ */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-md rounded-3xl p-lg shadow-sm ring-1 ring-black/5"
        style={{ background: "linear-gradient(135deg,#fff3ee,#fde8d8)" }}>
        <img src="/heoQA.png" alt="" className="h-14 w-14 object-contain shrink-0" />
        <div className="flex-1">
          <div className="font-bold text-gray-900">Vẫn còn thắc mắc?</div>
          <div className="text-[13px] text-gray-500">Xem thông tin liên hệ hỗ trợ hoặc trò chuyện cùng cộng đồng MeowBack.</div>
        </div>
        <Link
          href="/app/notifications"
          className="shrink-0 rounded-xl bg-[#e86a33] px-lg py-[10px] text-center text-[13px] font-bold text-white shadow-md shadow-[#e86a33]/25 transition-all hover:bg-[#d65d2a] active:scale-[0.97]"
        >
          Xem thông báo &amp; hỗ trợ
        </Link>
      </div>
    </div>
  );
}
