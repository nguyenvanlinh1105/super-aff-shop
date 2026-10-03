import { PageHeader } from "@/components/ui/PageHeader";

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
      "Cookie: cookie phiên đăng nhập để duy trì trạng thái đăng nhập an toàn.",
    ],
  },
  {
    title: "3. Mục đích sử dụng thông tin",
    list: [
      "Xác thực tài khoản và bảo vệ quyền truy cập của bạn.",
      "Ghi nhận, đối soát và tính toán chính xác số tiền hoàn cho từng đơn hàng.",
      "Xử lý yêu cầu rút tiền và chuyển khoản đến đúng tài khoản ngân hàng bạn khai báo.",
      "Gửi thông báo về trạng thái đơn hàng, thanh toán qua website và/hoặc Telegram.",
      "Chăm sóc khách hàng, hỗ trợ giải đáp thắc mắc qua Zalo, Fanpage, Telegram.",
      "Phát hiện và ngăn chặn các hành vi gian lận, trục lợi chương trình hoàn tiền hoặc giới thiệu bạn bè.",
    ],
  },
  {
    title: "4. Bảo mật thông tin",
    list: [
      "Mật khẩu tài khoản được mã hoá một chiều (hashing), MeowBack và nhân viên vận hành không có khả năng xem được mật khẩu gốc của bạn.",
      "Toàn bộ kết nối giữa trình duyệt và hệ thống đều được mã hoá qua giao thức HTTPS.",
      "Quyền truy cập vào dữ liệu khách hàng trong hệ thống quản trị được giới hạn nghiêm ngặt cho đội ngũ vận hành MeowBack.",
    ],
  },
  {
    title: "5. Chia sẻ thông tin với bên thứ ba",
    body: [
      "MeowBack không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin chỉ được sử dụng cho mục đích đối soát và chuyển tiền hoàn.",
    ],
  },
  {
    title: "6. Quyền của bạn đối với dữ liệu cá nhân",
    list: [
      "Yêu cầu xem, cập nhật hoặc chỉnh sửa thông tin cá nhân trực tiếp trong mục Cài đặt tài khoản.",
      "Yêu cầu ngừng nhận thông báo qua Telegram bằng cách huỷ liên kết bot.",
      "Yêu cầu đóng tài khoản và xoá dữ liệu cá nhân bằng cách liên hệ kênh hỗ trợ trực tuyến.",
    ],
  },
  {
    title: "7. Liên hệ",
    body: [
      "Nếu bạn có bất kỳ câu hỏi nào về cách MeowBack thu thập, sử dụng hoặc bảo vệ thông tin cá nhân, vui lòng liên hệ qua các kênh hỗ trợ trực tuyến.",
    ],
  },
];

export default function CustomerPrivacyPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Chính sách bảo mật"
        subtitle="Cam kết bảo vệ dữ liệu cá nhân và thông tin người dùng tại MeowBack"
      />

      <div className="rounded-3xl border border-primary-100 bg-white p-5 sm:p-8 shadow-sm flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="border-b border-neutral-100 pb-5 last:border-b-0 last:pb-0">
            <h2 className="text-[16px] sm:text-[18px] font-black text-neutral-900 mb-2">
              {section.title}
            </h2>
            {section.body?.map((p, i) => (
              <p
                key={i}
                className="text-[13.5px] sm:text-[14px] text-neutral-600 leading-relaxed mb-2 last:mb-0"
              >
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-2 flex flex-col gap-2 list-disc pl-5 text-[13.5px] sm:text-[14px] text-neutral-600">
                {section.list.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
