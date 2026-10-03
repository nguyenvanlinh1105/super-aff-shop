import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { safeJsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật — MeowBack",
  description:
    "Chính sách bảo mật thông tin cá nhân của người dùng MeowBack: dữ liệu thu thập, mục đích sử dụng, cookie, chia sẻ bên thứ ba và quyền của bạn.",
  alternates: { canonical: "/chinh-sach-bao-mat" },
  openGraph: {
    title: "Chính Sách Bảo Mật — MeowBack",
    description:
      "Chính sách bảo mật thông tin cá nhân của người dùng MeowBack: dữ liệu thu thập, mục đích sử dụng, cookie, chia sẻ bên thứ ba và quyền của bạn.",
    type: "website",
    locale: "vi_VN",
    url: "/chinh-sach-bao-mat",
    siteName: "MeowBack",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Trang chủ",
      item: "https://meowback.shop/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Chính sách bảo mật",
      item: "https://meowback.shop/chinh-sach-bao-mat",
    },
  ],
};

const SECTIONS = [
  {
    title: "1. Phạm vi áp dụng",
    body: [
      "Chính sách bảo mật này áp dụng cho toàn bộ thông tin cá nhân mà MeowBack thu thập khi bạn sử dụng website meowback.shop và bot Telegram chính thức của MeowBack. Bằng việc sử dụng dịch vụ, bạn đồng ý với cách thức thu thập và xử lý dữ liệu được mô tả dưới đây.",
    ],
  },
  {
    title: "2. Thông tin chúng tôi thu thập",
    list: [
      "Thông tin đăng ký: họ tên, số điện thoại, địa chỉ email, mật khẩu (được mã hoá, không lưu dưới dạng văn bản thuần).",
      'Thông tin đăng nhập Google: khi bạn chọn "Tiếp tục với Google", chúng tôi nhận email và tên hiển thị từ Google — không truy cập mật khẩu Google của bạn.',
      "Thông tin ngân hàng: tên ngân hàng, số tài khoản, tên chủ tài khoản — chỉ khi bạn chủ động khai báo để nhận thanh toán tiền hoàn.",
      "Thông tin liên kết Telegram: mã định danh (User ID) và tên người dùng Telegram, khi bạn liên kết bot với tài khoản web.",
      "Dữ liệu hoạt động: link hoàn tiền đã tạo, lịch sử đơn hàng, số dư ví, lịch sử giao dịch rút tiền.",
      "Cookie: cookie phiên đăng nhập để duy trì trạng thái đăng nhập, và cookie ghi nhận mã giới thiệu (ref_code, hiệu lực 30 ngày) khi bạn truy cập từ link mời của người khác.",
    ],
  },
  {
    title: "3. Mục đích sử dụng thông tin",
    list: [
      "Xác thực tài khoản và bảo vệ quyền truy cập của bạn.",
      "Ghi nhận, đối soát và tính toán chính xác số tiền hoàn cho từng đơn hàng.",
      "Xử lý yêu cầu rút tiền và chuyển khoản đến đúng tài khoản ngân hàng bạn khai báo.",
      "Gửi thông báo về trạng thái đơn hàng, thanh toán qua website và/hoặc Telegram (nếu đã liên kết).",
      "Chăm sóc khách hàng, hỗ trợ giải đáp thắc mắc qua Zalo, Fanpage, Telegram.",
      "Phát hiện và ngăn chặn các hành vi gian lận, trục lợi chương trình hoàn tiền hoặc giới thiệu bạn bè.",
    ],
  },
  {
    title: "4. Cookie và công nghệ theo dõi",
    body: [
      "MeowBack sử dụng cookie thiết yếu để duy trì phiên đăng nhập của bạn một cách an toàn (mã hoá, chỉ truyền qua kết nối HTTPS). Chúng tôi không sử dụng cookie quảng cáo của bên thứ ba.",
      "Khi bạn truy cập hệ thống từ một link mời (dạng meowback.shop/register?ref=...), một cookie ref_code được lưu trong 30 ngày để ghi nhận đúng người đã giới thiệu bạn nếu bạn đăng ký tài khoản trong khoảng thời gian đó.",
    ],
  },
  {
    title: "5. Chia sẻ thông tin với bên thứ ba",
    body: [
      "MeowBack không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp sau:",
    ],
    list: [
      "Với ngân hàng bạn khai báo: chỉ số tài khoản/tên chủ tài khoản cần thiết để thực hiện chuyển khoản tiền hoàn.",
      "Với Google: khi bạn chọn đăng nhập bằng Google, việc xác thực diễn ra trực tiếp giữa bạn và Google theo chính sách bảo mật của Google.",
      "Với Telegram: khi bạn liên kết bot, việc gửi/nhận tin nhắn diễn ra qua hạ tầng của Telegram theo chính sách bảo mật của Telegram.",
      "Khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền theo quy định của pháp luật Việt Nam.",
      "Chúng tôi không chủ động gửi thông tin cá nhân của bạn cho Shopee, TikTok Shop hay các sàn liên kết khác — các sàn này chỉ ghi nhận lượt click/đơn hàng qua link theo dõi ẩn danh, không gắn với thông tin định danh cá nhân của bạn.",
    ],
  },
  {
    title: "6. Bảo mật thông tin",
    list: [
      "Mật khẩu tài khoản được mã hoá một chiều (hashing), MeowBack và nhân viên vận hành không có khả năng xem được mật khẩu gốc của bạn.",
      "Toàn bộ kết nối giữa trình duyệt/Telegram và hệ thống đều được mã hoá qua giao thức HTTPS.",
      "Quyền truy cập vào dữ liệu khách hàng trong hệ thống quản trị được giới hạn cho đội ngũ vận hành MeowBack, phục vụ đúng mục đích nghiệp vụ.",
    ],
  },
  {
    title: "7. Thời gian lưu trữ dữ liệu",
    body: [
      "Thông tin cá nhân được lưu trữ trong suốt thời gian tài khoản của bạn còn hoạt động, nhằm phục vụ việc đối soát đơn hàng và tra cứu lịch sử giao dịch. Sau khi tài khoản bị đóng theo yêu cầu của bạn, dữ liệu có thể được lưu trữ thêm một khoảng thời gian hợp lý để phục vụ đối chiếu kế toán, giải quyết khiếu nại hoặc theo yêu cầu của pháp luật, trước khi được xoá hoặc ẩn danh hoá.",
    ],
  },
  {
    title: "8. Quyền của bạn đối với dữ liệu cá nhân",
    list: [
      "Yêu cầu xem, cập nhật hoặc chỉnh sửa thông tin cá nhân (họ tên, số điện thoại, thông tin ngân hàng...) trực tiếp trong mục Cài đặt tài khoản.",
      "Yêu cầu ngừng nhận thông báo qua Telegram bằng cách huỷ liên kết bot.",
      "Yêu cầu đóng tài khoản và xoá dữ liệu cá nhân, bằng cách liên hệ Zalo hoặc các kênh hỗ trợ trực tuyến — trừ các dữ liệu bắt buộc phải lưu giữ theo quy định pháp luật.",
    ],
  },
  {
    title: "9. Đối tượng sử dụng dịch vụ",
    body: [
      "Dịch vụ của MeowBack dành cho người dùng từ đủ 18 tuổi trở lên. Chúng tôi không chủ đích thu thập thông tin cá nhân của trẻ em dưới 18 tuổi.",
    ],
  },
  {
    title: "10. Thay đổi chính sách",
    body: [
      "Chính sách bảo mật này có thể được cập nhật theo từng thời kỳ. Phiên bản mới nhất luôn được đăng tải tại trang này và có hiệu lực kể từ thời điểm đăng tải.",
    ],
  },
  {
    title: "11. Liên hệ",
    body: [
      "Nếu bạn có bất kỳ câu hỏi nào về cách MeowBack thu thập, sử dụng hoặc bảo vệ thông tin cá nhân, vui lòng liên hệ qua các kênh hỗ trợ chính thức tại chân trang website.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans overflow-x-hidden text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }}
      />
      <MarketingHeader activePath="/chinh-sach-bao-mat" />

      <main className="pt-[80px]">
        <section className="bg-gradient-to-b from-[#fff0e6] to-white py-3xl relative overflow-hidden">
          <div className="max-w-[800px] mx-auto px-lg relative z-10 text-center">
            <h1 className="text-[36px] md:text-[48px] font-black text-ink tracking-tight mb-md">
              Chính Sách <span className="text-primary">Bảo Mật</span>
            </h1>
            <p className="text-[16px] text-mute max-w-xl mx-auto leading-relaxed">
              Cập nhật lần cuối: tháng 7/2026. MeowBack cam kết bảo vệ thông tin
              cá nhân của bạn.
            </p>
          </div>
        </section>

        <section className="py-2xl max-w-[800px] mx-auto px-lg pb-3xl">
          <div className="bg-white rounded-[32px] p-2xl border border-primary/10 shadow-lg shadow-primary/5 flex flex-col gap-2xl">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-[20px] font-black text-ink mb-md">
                  {section.title}
                </h2>
                {section.body?.map((p, i) => (
                  <p
                    key={i}
                    className="text-[15px] text-mute leading-relaxed mb-sm last:mb-0"
                  >
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-sm flex flex-col gap-sm">
                    {section.list.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-sm text-[15px] text-mute leading-relaxed"
                      >
                        <span className="text-primary mt-[2px]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
