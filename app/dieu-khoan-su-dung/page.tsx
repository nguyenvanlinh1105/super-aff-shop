import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { safeJsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Điều Khoản Sử Dụng — MeowBack",
  description:
    "Điều khoản và điều kiện sử dụng nền tảng hoàn tiền MeowBack: cách hoạt động hoàn tiền, chương trình giới thiệu, rút tiền và trách nhiệm các bên.",
  alternates: { canonical: "/dieu-khoan-su-dung" },
  openGraph: {
    title: "Điều Khoản Sử Dụng — MeowBack",
    description:
      "Điều khoản và điều kiện sử dụng nền tảng hoàn tiền MeowBack: cách hoạt động hoàn tiền, chương trình giới thiệu, rút tiền và trách nhiệm các bên.",
    type: "website",
    locale: "vi_VN",
    url: "/dieu-khoan-su-dung",
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
      name: "Điều khoản sử dụng",
      item: "https://meowback.shop/dieu-khoan-su-dung",
    },
  ],
};

const SECTIONS = [
  {
    title: "1. Giới thiệu chung",
    body: [
      'MeowBack ("chúng tôi", "hệ thống", "dịch vụ") là nền tảng affiliate hoàn tiền, giúp người dùng ("bạn", "khách hàng") nhận lại một phần hoa hồng affiliate khi mua sắm qua các sàn thương mại điện tử liên kết như Shopee và TikTok Shop.',
      "Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ tính năng nào của MeowBack (website, bot Telegram), bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ nội dung Điều khoản sử dụng này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.",
    ],
  },
  {
    title: "2. Định nghĩa",
    body: [
      '"Link hoàn tiền" là đường dẫn theo dõi (tracking link) do hệ thống tạo ra khi bạn dán link sản phẩm từ sàn liên kết; mọi đơn hàng chỉ được ghi nhận khi phát sinh qua đúng link này.',
      '"Đơn hàng hợp lệ" là đơn hàng được sàn liên kết xác nhận phát sinh từ link hoàn tiền của bạn, không bị huỷ, hoàn trả hoặc từ chối hoa hồng bởi sàn.',
      '"Số dư khả dụng" là tổng số tiền hoàn từ các đơn hàng đã được duyệt (orderStatus: approved) nhưng chưa được chi trả.',
    ],
  },
  {
    title: "3. Điều kiện sử dụng dịch vụ",
    body: [
      "Bạn phải từ đủ 18 tuổi trở lên và có đầy đủ năng lực hành vi dân sự để tự mình giao kết và thực hiện các giao dịch dân sự theo quy định pháp luật Việt Nam.",
      "Thông tin đăng ký (họ tên, số điện thoại, email, thông tin ngân hàng khi khai báo rút tiền) phải chính xác, trung thực và thuộc quyền sở hữu hợp pháp của bạn.",
      "Mỗi cá nhân chỉ được sở hữu một (01) tài khoản duy nhất. Hệ thống có quyền tạm khoá hoặc từ chối xử lý các tài khoản trùng lặp được tạo nhằm mục đích trục lợi chương trình giới thiệu hoặc khuyến mãi.",
    ],
  },
  {
    title: "4. Cách thức hoạt động của dịch vụ hoàn tiền",
    body: [
      "Bạn chọn sàn thương mại điện tử, dán link sản phẩm muốn mua vào hệ thống (qua website hoặc bot Telegram) để nhận về một link hoàn tiền riêng.",
      "Khi bạn hoàn tất mua hàng thông qua đúng link này, sàn liên kết ghi nhận một khoản hoa hồng affiliate cho MeowBack. Sau khi đơn hàng được sàn xác nhận không bị huỷ/hoàn trả, hệ thống chia lại phần lớn khoản hoa hồng này cho bạn dưới dạng tiền hoàn vào ví.",
      "Tỷ lệ chia hoa hồng cụ thể do MeowBack quy định và có thể điều chỉnh theo từng thời kỳ, ngành hàng hoặc chương trình khuyến mãi, được công bố công khai trên hệ thống tại thời điểm bạn tạo link.",
    ],
  },
  {
    title: "5. Điều kiện để đơn hàng được ghi nhận hoàn tiền",
    body: [
      "Để đảm bảo đơn hàng được sàn liên kết ghi nhận hoa hồng chính xác, bạn cần tuân thủ các lưu ý sau khi mua sắm:",
    ],
    list: [
      "Xoá các sản phẩm tương tự đã có sẵn trong giỏ hàng trước khi bấm vào link hoàn tiền.",
      "Không bấm vào bất kỳ link nào khác (livestream, quảng cáo, link từ nguồn khác) trong quá trình mua hàng.",
      "Hoàn tất thanh toán trong cùng một phiên trình duyệt đã mở link hoàn tiền.",
      "MeowBack không có khả năng can thiệp hoặc bảo đảm cho các đơn hàng không tuân thủ đúng quy trình trên, do việc ghi nhận hoa hồng phụ thuộc hoàn toàn vào hệ thống đối soát của sàn liên kết.",
    ],
  },
  {
    title: "6. Thời gian duyệt và rút tiền",
    body: [
      'Sau khi đặt hàng, đơn của bạn ở trạng thái "Chờ duyệt" trong thời gian sàn liên kết xác nhận đơn không bị huỷ hay hoàn trả (thường từ vài ngày đến vài tuần tuỳ chính sách của từng sàn). MeowBack không quyết định và không rút ngắn được thời gian đối soát này.',
      'Khi đơn được duyệt, số tiền hoàn chuyển sang trạng thái "Sẵn sàng rút". Bạn cần khai báo đầy đủ, chính xác thông tin tài khoản ngân hàng nhận tiền trước khi gửi yêu cầu rút.',
      "Mức rút tối thiểu là 10.000đ mỗi lần yêu cầu. Yêu cầu rút tiền được xử lý và chuyển khoản thủ công bởi đội ngũ MeowBack, thời gian xử lý thông thường trong vòng vài ngày làm việc.",
    ],
  },
  {
    title: "7. Chương trình giới thiệu bạn bè",
    body: [
      "Khi bạn giới thiệu người khác đăng ký tài khoản qua link mời của mình (bao gồm cả trường hợp người được mời đăng ký bằng email/mật khẩu hoặc bằng tài khoản Google), bạn có thể nhận thêm hoa hồng giới thiệu tính theo phần trăm trên số tiền hoàn của các đơn hàng người đó thực hiện, trong một khoảng thời gian hiệu lực nhất định kể từ ngày người đó đăng ký.",
      "Hoa hồng giới thiệu chỉ áp dụng cho người trực tiếp giới thiệu (không tính nhiều tầng): nếu bạn giới thiệu B, và B giới thiệu tiếp C, thì hoa hồng từ đơn hàng của C thuộc về B — bạn không nhận được gì từ đơn hàng của C.",
      'Số lượng đơn hàng tối đa được tính hoa hồng áp dụng RIÊNG cho từng người bạn bạn giới thiệu — mời càng nhiều người, số đơn được tính hoa hồng càng nhiều, không bị dồn chung vào một hạn mức duy nhất cho tất cả bạn bè. Tỷ lệ hoa hồng, số lượng đơn hàng tối đa mỗi người và thời hạn hiệu lực do MeowBack quy định, được công bố tại mục "Mời bạn" trên hệ thống và có thể thay đổi theo từng thời kỳ.',
      "Hành vi tạo tài khoản ảo, tự giới thiệu chính mình bằng thiết bị/thông tin khác, hoặc mua bán link giới thiệu nhằm trục lợi đều bị coi là gian lận và có thể bị thu hồi hoa hồng, khoá tài khoản liên quan.",
    ],
  },
  {
    title: "8. Các hành vi bị nghiêm cấm",
    list: [
      "Sử dụng thông tin cá nhân không thuộc quyền sở hữu của mình để đăng ký hoặc rút tiền.",
      "Tạo nhiều tài khoản, sử dụng bot tự động hoặc các thủ đoạn gian lận khác để trục lợi hoa hồng hoặc hoa hồng giới thiệu.",
      "Can thiệp, phá hoại hoặc cố gắng truy cập trái phép vào hệ thống, cơ sở dữ liệu của MeowBack.",
      "Sử dụng dịch vụ cho bất kỳ mục đích trái pháp luật nào theo quy định của pháp luật Việt Nam.",
    ],
  },
  {
    title: "9. Quyền và trách nhiệm của MeowBack",
    body: [
      "MeowBack có quyền tạm ngừng, từ chối chi trả hoặc khoá tài khoản nếu phát hiện dấu hiệu gian lận, vi phạm điều khoản này, hoặc theo yêu cầu của sàn liên kết/cơ quan chức năng có thẩm quyền.",
      "MeowBack có trách nhiệm chi trả đầy đủ, đúng hạn số tiền hoàn hợp lệ theo đúng chính sách đã công bố, và bảo mật thông tin cá nhân của khách hàng theo Chính sách bảo mật.",
    ],
  },
  {
    title: "10. Giới hạn trách nhiệm",
    body: [
      "MeowBack đóng vai trò trung gian kết nối và không kiểm soát chính sách hoa hồng, thời gian đối soát, hay quyết định phê duyệt/từ chối đơn hàng của các sàn liên kết. Mọi thay đổi từ phía sàn (thay đổi tỷ lệ hoa hồng, huỷ đơn, từ chối ghi nhận) nằm ngoài khả năng kiểm soát của MeowBack.",
      "MeowBack không chịu trách nhiệm với các tổn thất phát sinh từ việc khách hàng không tuân thủ đúng hướng dẫn sử dụng link hoàn tiền, cung cấp sai thông tin tài khoản ngân hàng, hoặc do sự cố kỹ thuật ngoài ý muốn từ bên thứ ba (sàn thương mại điện tử, ngân hàng, nhà cung cấp hạ tầng).",
    ],
  },
  {
    title: "11. Thay đổi điều khoản",
    body: [
      "MeowBack có thể cập nhật, sửa đổi Điều khoản sử dụng này theo từng thời kỳ để phù hợp với thực tế vận hành và quy định pháp luật. Phiên bản mới nhất luôn được đăng tải tại trang này và có hiệu lực kể từ thời điểm đăng tải.",
      "Việc bạn tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi đó.",
    ],
  },
  {
    title: "12. Liên hệ",
    body: [
      "Nếu có bất kỳ thắc mắc nào về Điều khoản sử dụng, vui lòng liên hệ đội ngũ MeowBack qua hotline 0387.092.630 hoặc các kênh mạng xã hội chính thức tại chân trang website.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-canvas font-sans overflow-x-hidden text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }}
      />
      <MarketingHeader activePath="/dieu-khoan-su-dung" />

      <main className="pt-[80px]">
        <section className="bg-gradient-to-b from-[#fff0e6] to-white py-3xl relative overflow-hidden">
          <div className="max-w-[800px] mx-auto px-lg relative z-10 text-center">
            <h1 className="text-[36px] md:text-[48px] font-black text-ink tracking-tight mb-md">
              Điều Khoản <span className="text-primary">Sử Dụng</span>
            </h1>
            <p className="text-[16px] text-mute max-w-xl mx-auto leading-relaxed">
              Cập nhật lần cuối: tháng 7/2026. Vui lòng đọc kỹ trước khi sử dụng
              dịch vụ hoàn tiền MeowBack.
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
