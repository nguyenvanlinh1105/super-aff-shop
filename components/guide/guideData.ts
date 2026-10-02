export interface GuideStep {
  step: number;
  title: string;
  tagline: string;
  body: string;
  tips: string;
  imageDesktop: string;
  imageMobile: string;
  screenTitle: string;
}

export interface TipCard {
  title: string;
  body: string;
  image: string;
  color: string;
  borderColor: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: "Chọn sàn & Dán link sản phẩm",
    tagline: "Shopee • TikTok Shop • Lazada",
    body: "Mở ứng dụng Shopee, TikTok Shop hoặc Lazada, tìm sản phẩm bạn muốn mua và bấm biểu tượng Chia sẻ để Sao chép liên kết. Sau đó quay lại MeowBack, chọn đúng biểu tượng sàn mua sắm, dán link vào ô và bấm nút \"Tạo link hoàn tiền\".",
    tips: "Hệ thống hỗ trợ mọi định dạng link: link rút gọn s.shopee.vn, vt.tiktok.com, lazada.vn hoặc link web đầy đủ.",
    imageDesktop: "/guide-step-1.png",
    imageMobile: "/guide-step-1-mobile.png",
    screenTitle: "Giao diện Chọn sàn & Dán link",
  },
  {
    step: 2,
    title: "Bấm vào link hoàn tiền hoặc nhấn \"Mở\"",
    tagline: "Kích hoạt Tracking hoa hồng",
    body: "Ngay sau khi bấm tạo link, MeowBack sẽ hiển thị thẻ Thông tin sản phẩm cùng Link hoàn tiền độc quyền gắn mã theo dõi của bạn. Bạn chỉ cần nhấn nút \"Mở\" để ứng dụng sàn tự động bật lên, hoặc bấm \"Copy link\" dán vào trình duyệt/app sàn.",
    tips: "Luôn mở sản phẩm qua link hoàn tiền này để sàn ghi nhận hoa hồng chính xác cho tài khoản của bạn.",
    imageDesktop: "/guide-step-2.png",
    imageMobile: "/guide-step-2-mobile.png",
    screenTitle: "Thẻ kết quả link hoàn tiền kèm mã tracking và nút Mở",
  },
  {
    step: 3,
    title: "Mua hàng & Thanh toán trên App sàn",
    tagline: "Thực hiện thanh toán như bình thường",
    body: "Khi ứng dụng sàn mở ra đúng sản phẩm, bạn tiến hành bấm Mua ngay hoặc Thêm vào giỏ và thanh toán. Bạn vẫn áp dụng được trọn vẹn mọi mã giảm giá, voucher freeship của Shopee, TikTok, Lazada như bình thường.",
    tips: "Lưu ý vàng: Mua ngay trong phiên mở link. Không bấm qua livestream hay xem video khác để tránh bị đứt cookie tracking.",
    imageDesktop: "/guide-step-3.png",
    imageMobile: "/guide-step-3.png",
    screenTitle: "Mua sắm và thanh toán đơn hàng trên App sàn",
  },
  {
    step: 4,
    title: "Theo dõi đơn hàng tự động trên MeowBack",
    tagline: "Tự động đồng bộ sau khi đặt hàng",
    body: "Sau khi bạn thanh toán thành công, hệ thống sàn sẽ tự động đồng bộ thông tin đơn về mục \"Đơn hàng\" trên MeowBack sau vài phút đến vài giờ. Trạng thái ban đầu sẽ là \"Chờ xác nhận\".",
    tips: "Bạn có thể kiểm tra mã đơn, giá trị đơn hàng, tỷ lệ % và số tiền hoàn dự kiến bất cứ lúc nào.",
    imageDesktop: "/guide-step-4.png",
    imageMobile: "/guide-step-4-mobile.png",
    screenTitle: "Mục Đơn hàng ghi nhận tự động trên MeowBack",
  },
  {
    step: 5,
    title: "Tiền về Ví & Rút tiền về Ngân hàng",
    tagline: "Hoàn tất đối soát và rút thưởng",
    body: "Khi đơn hàng hoàn tất giao thành công và hết hạn khiếu nại đổi trả (khoảng 7–20 ngày tùy sàn), tiền hoàn sẽ được chuyển thẳng vào mục \"Số dư khả dụng\" trong Ví tiền của bạn.",
    tips: "Chỉ cần nhấn \"Yêu cầu rút tiền\" để chuyển tiền về tài khoản ngân hàng hoặc ví MoMo theo kỳ thanh toán của MeowBack!",
    imageDesktop: "/guide-step-5.png",
    imageMobile: "/guide-step-5-mobile.png",
    screenTitle: "Trang Ví tiền & Yêu cầu rút thưởng về tài khoản",
  },
];

export const TIP_CARDS: TipCard[] = [
  {
    title: "Xoá sản phẩm khỏi giỏ hàng trước khi nhấp link",
    body: "Nếu sản phẩm đã nằm sẵn trong giỏ hàng từ trước, hệ thống sàn có thể không ghi nhận hoa hồng. Hãy xoá sản phẩm khỏi giỏ hàng, sau đó mới bấm vào link hoàn tiền từ MeowBack và thêm lại để mua.",
    image: "/tip-card-1.jpg",
    color: "from-rose-50 to-pink-50",
    borderColor: "border-rose-200/70",
  },
  {
    title: "Bấm vào sản phẩm là mua luôn — Không xem linh tinh",
    body: "Sau khi nhấp vào link hoàn tiền, hãy mua ngay sản phẩm đó. Đừng bấm sang sản phẩm khác, xem video hay lướt livestream sau khi đã mở link vì sẽ làm đứt chuỗi theo dõi hoa hồng (cookie tracking).",
    image: "/tip-card-2.jpg",
    color: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200/70",
  },
  {
    title: "Thoát hẳn ứng dụng sàn trước và sau khi đặt đơn",
    body: "Trước khi bấm link chuyển đổi, hãy vuốt tắt hẳn ứng dụng Shopee/TikTok/Lazada (kill app). Sau khi đặt đơn thành công cũng thoát hẳn ứng dụng để hệ thống sàn chốt phiên theo dõi sạch nhất.",
    image: "/tip-card-3.jpg",
    color: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200/70",
  },
  {
    title: "KHÔNG mua sản phẩm trong Live hoặc Video gắn tag",
    body: "Đơn hàng mua trong phòng livestream hoặc video thường bị sàn ưu tiên ghi nhận hoa hồng cho chủ phòng live/creator tạo video, khiến đơn hoàn tiền qua MeowBack bị huỷ hoặc không được ghi nhận.",
    image: "/tip-card-4.jpg",
    color: "from-rose-50 to-red-50",
    borderColor: "border-rose-200/70",
  },
  {
    title: "Mỗi lần chỉ đặt 1 shop duy nhất trong một đơn",
    body: "Không thanh toán gộp nhiều shop khác nhau trong cùng một lần thanh toán. Mỗi lượt tạo link chỉ nên thanh toán các sản phẩm của cùng 1 gian hàng để sàn đối soát hoa hồng đầy đủ.",
    image: "/tip-card-5.jpg",
    color: "from-pink-50 to-emerald-50",
    borderColor: "border-pink-200/70",
  },
  {
    title: "KHÔNG đổi địa chỉ nhận hàng khi đã click link",
    body: "Sau khi nhấp link chuyển đổi sang app sàn, tuyệt đối không thay đổi địa chỉ nhận hàng lúc thanh toán. Việc đổi địa chỉ có thể làm thay đổi tuyến kho vận hoặc reset cookie tracking, dẫn đến đơn bị mất hoa hồng.",
    image: "/tip-card-7.jpg",
    color: "from-amber-50 to-rose-50",
    borderColor: "border-amber-200/70",
  },
  {
    title: "Vào nhóm Zalo & kiểm tra mục Đơn hàng",
    body: "Sau khi đặt đơn khoảng 5–15 phút (hoặc tối đa vài giờ), hãy vào mục Đơn hàng trên MeowBack hoặc tham gia nhóm Zalo hỗ trợ để kiểm tra xem đơn hàng đã được hệ thống ghi nhận đối soát hay chưa.",
    image: "/tip-card-6.jpg",
    color: "from-pink-50 to-amber-50",
    borderColor: "border-pink-200/70",
  },
];
