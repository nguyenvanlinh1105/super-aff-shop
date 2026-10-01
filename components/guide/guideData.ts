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
    title: "Luôn bấm lại link mỗi lần mua",
    body: "Mỗi lượt mua hàng trên Shopee, TikTok Shop hoặc Lazada cần bấm lại link hoàn tiền ngay trước khi vào sàn. Nếu đã tắt ứng dụng hoặc để qua ngày, link theo dõi có thể hết hiệu lực và đơn sẽ không được ghi nhận.",
    image: "/tip-card-1.jpg",
    color: "from-rose-50 to-pink-50",
    borderColor: "border-rose-200/70",
  },
  {
    title: "Click vào sản phẩm là mua luôn",
    body: "Sau khi bấm link hoàn tiền, hãy mua ngay sản phẩm đó trên ứng dụng sàn. Tránh click sang các sản phẩm gợi ý khác hoặc lướt video/livestream sau khi đã nhấp vào link chuyển đổi.",
    image: "/tip-card-2.jpg",
    color: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200/70",
  },
  {
    title: "Thoát hẳn ứng dụng trước và sau khi đặt đơn",
    body: "Trước khi bấm link, hãy vuốt tắt hẳn ứng dụng sàn (kill app). Sau khi đặt đơn xong cũng thoát hẳn. Điều này giúp hệ thống sàn kích hoạt luồng theo dõi phiên click sạch nhất.",
    image: "/tip-card-3.jpg",
    color: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200/70",
  },
  {
    title: "KHÔNG mua sản phẩm trên Live hoặc Video gắn tag",
    body: "Sản phẩm mua qua phòng Livestream hoặc Video trên TikTok/Shopee thường bị sàn ưu tiên ghi nhận hoa hồng cho chủ phòng live, khiến đơn hoàn tiền qua MeowBack bị từ chối.",
    image: "/tip-card-4.jpg",
    color: "from-rose-50 to-red-50",
    borderColor: "border-rose-200/70",
  },
  {
    title: "Mỗi lần thanh toán chỉ đặt 1 Shop",
    body: "KHÔNG thanh toán gộp nhiều shop khác nhau trong cùng 1 đơn hàng. Mỗi lần tạo link và thanh toán chỉ nên áp dụng cho 1 shop duy nhất để đơn được đối soát đầy đủ.",
    image: "/tip-card-5.jpg",
    color: "from-pink-50 to-emerald-50",
    borderColor: "border-pink-200/70",
  },
  {
    title: "Thời gian đối soát thường mất 7–20 ngày",
    body: "Các sàn Shopee, TikTok Shop, Lazada chỉ chốt hoa hồng sau khi hết thời hạn đổi trả/khiếu nại. Đơn ở trạng thái \"Chờ xác nhận\" là hoàn toàn bình thường, tiền sẽ tự động về ví khi đến kỳ đối soát.",
    image: "/tip-card-6.jpg",
    color: "from-pink-50 to-amber-50",
    borderColor: "border-pink-200/70",
  },
];
