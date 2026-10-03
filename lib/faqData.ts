export type FaqItem = { question: string; answer: string; group: string };

export const FAQ_GROUPS = [
  "Về cách hoạt động",
  "Về tiền hoàn",
  "Về lý do link không ghi nhận",
  "Về mời bạn bè",
  "Các tình huống khác",
] as const;

export const FAQ_ITEMS: FaqItem[] = [
  // Về cách hoạt động
  {
    group: "Về cách hoạt động",
    question: "MeowBack hoạt động như thế nào?",
    answer:
      "Khi bạn mua hàng qua link MeowBack, Shopee trả hoa hồng affiliate cho chúng tôi. MeowBack chia lại phần lớn khoản này vào ví của bạn dưới dạng tiền mặt — hoàn toàn tự động, không cần làm thêm gì.",
  },
  {
    group: "Về cách hoạt động",
    question: "MeowBack có lấy phí không?",
    answer:
      "Hoàn toàn miễn phí. Không phí đăng ký, không phí tạo link, không phí rút tiền.",
  },
  {
    group: "Về cách hoạt động",
    question:
      "Tôi có thể dùng MeowBack kết hợp với voucher Shopee, mã freeship, Shopee Xu không?",
    answer:
      "Được. Hoàn tiền MeowBack tính độc lập — bạn vẫn áp đầy đủ voucher, mã giảm giá, Shopee Xu như bình thường trước khi mua. Hai khoản không ảnh hưởng nhau.",
  },
  {
    group: "Về cách hoạt động",
    question: "Tôi mua sản phẩm trong mục Ưu đãi có được hoàn tiền không?",
    answer:
      "Có, nhưng tuỳ loại deal. Mỗi deal trong mục Ưu đãi có 1 trong 2 loại, ghi rõ ngay trên thẻ sản phẩm:\n" +
      "🎯 Sản phẩm cụ thể — bấm vào là mở đúng sản phẩm đó trên Shopee, mua ngay, hoàn tiền tự động ghi nhận, không cần làm thêm gì.\n" +
      "🏬 Cả Shop / Bộ sưu tập — deal này giới thiệu cả một shop hoặc nhiều sản phẩm đang giảm giá. Bạn cần chọn đúng sản phẩm mình muốn mua, sau đó vào mục Hoàn tiền dán link sản phẩm đó để tạo link riêng, rồi mới thanh toán — như vậy hoàn tiền mới được ghi nhận chính xác.",
  },
  {
    group: "Về cách hoạt động",
    question: "Tôi mua trên app Shopee điện thoại được không?",
    answer:
      "Được. Sau khi tạo link trên MeowBack, bấm vào link đó — hệ thống tự mở app Shopee với mã tracking đã gắn sẵn. Bạn mua bình thường trên app, hoàn tiền tự ghi nhận.",
  },

  // Về tiền hoàn
  {
    group: "Về tiền hoàn",
    question: "Bao lâu tiền về ví MeowBack sau khi đơn giao thành công?",
    answer:
      "7–15 ngày sau khi đơn được xác nhận hoàn tất. Thời gian này phụ thuộc vào kỳ đối soát của Shopee với hệ thống affiliate.",
  },
  {
    group: "Về tiền hoàn",
    question: "Tỷ lệ hoàn tiền tính trên cái gì?",
    answer:
      "Tính trên giá trị đơn hàng thực tế sau khi đã áp voucher và giảm giá. Tỷ lệ khác nhau theo từng danh mục sản phẩm.",
  },
  {
    group: "Về tiền hoàn",
    question:
      "Đơn hàng của tôi được ghi nhận nhưng lại không có hoa hồng, tại sao?",
    answer:
      "Có thể do sản phẩm đó không có hoa hồng affiliate từ Shopee và Shop (không phải sản phẩm nào cũng tham gia chương trình tiếp thị liên kết). Bạn có thể cân nhắc đặt sản phẩm tương tự ở shop khác nhé.",
  },
  {
    group: "Về tiền hoàn",
    question: "Rút tiền tối thiểu bao nhiêu? Về đâu?",
    answer:
      "Rút tối thiểu 10.000đ, về thẳng tài khoản ngân hàng. Không có phí rút.",
  },
  {
    group: "Về tiền hoàn",
    question: "Tôi trả hàng hoặc hoàn đơn thì tiền cashback xử lý thế nào?",
    answer:
      "Đơn trả hàng hoặc hoàn tiền sẽ không được ghi nhận hoa hồng. Nếu tiền đã vào ví trước khi bạn trả hàng, hệ thống sẽ trừ lại khoản tương ứng.",
  },
  {
    group: "Về tiền hoàn",
    question: "Rút tiền mất bao lâu? Về đúng tài khoản nào?",
    answer:
      "Sau khi bạn yêu cầu rút, tiền về tài khoản ngân hàng trong vòng 24h. Tiền chuyển về đúng số tài khoản ngân hàng bạn đã liên kết trong phần Cài đặt. Kiểm tra lại thông tin tài khoản trước khi rút để tránh sai số.",
  },

  // Về lý do link không ghi nhận
  {
    group: "Về lý do link không ghi nhận",
    question: "Tại sao link của tôi không được ghi nhận?",
    answer:
      "Để link được ghi nhận chính xác, bạn cần lưu ý:\n" +
      "1. Xóa giỏ hàng sản phẩm cần mua trước khi nhấp vào link chuyển đổi.\n" +
      "2. Không xem video hay live sau khi nhấp vào link chuyển đổi.\n" +
      "3. Thoát hẳn ứng dụng trước và sau khi đặt đơn.\n" +
      "4. Mỗi lần chỉ đặt 1 Shop, không đặt nhiều shop khác nhau trong 1 lần thanh toán.\n" +
      "5. Khi click vào sản phẩm là mua luôn, không click sang sản phẩm khác.\n" +
      "6. Có những sản phẩm không ghi nhận hoa hồng, vui lòng theo dõi ở Zalo để kiểm tra.",
  },
  {
    group: "Về lý do link không ghi nhận",
    question: "Mua trên Livestream hoặc Shopee Video có được hoàn tiền không?",
    answer:
      "Rất tiếc là KHÔNG bạn nhé. Khi mua qua Livestream hoặc Shopee Video, hoa hồng sẽ được ghi nhận cho người phát Live hoặc người đăng Video — không qua MeowBack — nên chúng tôi không thể hoàn lại cho bạn. Để nhận hoàn tiền, bạn hãy mua trực tiếp qua link được chuyển đổi từ MeowBack.",
  },
  {
    group: "Về lý do link không ghi nhận",
    question: "Bao lâu thì đơn hàng được ghi nhận?",
    answer:
      "Thông thường đơn hàng sẽ xuất hiện trong 24–48 giờ sau khi bạn đặt. Ví dụ: đặt hàng trong ngày 25 → hệ thống ghi nhận vào ngày 26. Bạn vào mục Đơn hàng trên web MeowBack để theo dõi trạng thái nhé!",
  },
  {
    group: "Về lý do link không ghi nhận",
    question: "Mua nhiều sản phẩm trong nhiều shop được không?",
    answer:
      "Được. Mỗi sản phẩm tạo 1 link → nhấp vào link chuyển đổi và thêm vào giỏ hàng từng sản phẩm → thanh toán 1 lần.\n\n" +
      "KHÔNG MUA gộp 2 shop cùng lúc.",
  },
  {
    group: "Về lý do link không ghi nhận",
    question: "Làm sao biết đơn của tôi đã được ghi nhận chưa?",
    answer:
      'Vào mục đơn hàng trên web MeowBack → Đơn ghi nhận thành công sẽ hiện trạng thái "Đang chờ duyệt" trong vòng 24–48h sau khi mua. Nếu sau 48h không thấy, bạn có thể hủy và đặt lại đơn khác (nếu không gấp) hoặc liên hệ kênh hỗ trợ Zalo để được hỗ trợ.',
  },
  {
    group: "Về lý do link không ghi nhận",
    question: "Tôi dùng Bot Telegram có bị ảnh hưởng gì không?",
    answer:
      "Không. Bot Telegram và web MeowBack dùng chung tài khoản — tiền hoàn về cùng một ví, theo dõi được trên cả hai nơi.",
  },

  // Về mời bạn bè
  {
    group: "Về mời bạn bè",
    question: "Cơ chế 5% mời bạn hoạt động thế nào?",
    answer:
      "Khi bạn mời một người dùng mới đăng ký qua link giới thiệu của bạn, bạn nhận thêm 5% trên tiền hoàn của 5 đơn hàng đầu tiên của họ. Người được mời vẫn nhận đủ 100% tiền hoàn của họ — 5% này MeowBack trả thêm cho bạn, không trừ vào phần của bạn bè.",
  },
  {
    group: "Về mời bạn bè",
    question: "Tôi lấy link giới thiệu ở đâu?",
    answer:
      "Vào dashboard → mục Giới thiệu bạn bè → copy link cá nhân → chia sẻ cho bạn bè. Mỗi tài khoản có một link riêng.",
  },
  {
    group: "Về mời bạn bè",
    question: "Bạn tôi đăng ký rồi nhưng tôi chưa thấy 5% — sao vậy?",
    answer:
      "5% chỉ được ghi nhận sau khi bạn bè hoàn tất đơn hàng đầu tiên và đơn đó được duyệt (7–15 ngày). Nếu họ chưa mua đơn nào, chưa có gì để tính.",
  },

  // Các tình huống khác
  {
    group: "Các tình huống khác",
    question: "Tôi có thể tạo link cho người khác mua giúp không?",
    answer:
      "Được. Link MeowBack không gắn với tài khoản người mua — chỉ cần người mua bấm đúng link của bạn trước khi thanh toán là hoa hồng về ví bạn.",
  },
  {
    group: "Các tình huống khác",
    question: "Shopee Flash Sale, deal sốc có được hoàn tiền không?",
    answer:
      "Phụ thuộc vào chính sách hoa hồng của Shopee cho từng chương trình. Một số flash sale Shopee loại trừ affiliate — MeowBack không kiểm soát được điều này. Khuyến nghị tạo link chuyển đổi từ sản phẩm trong Ưu Đãi trước khi mua.",
  },
  {
    group: "Các tình huống khác",
    question: "Tài khoản MeowBack có hết hạn không?",
    answer:
      "Không. Tài khoản giữ nguyên miễn phí mãi mãi. Số dư trong ví không bị trừ dù bạn không dùng trong thời gian dài.",
  },
  {
    group: "Các tình huống khác",
    question: "Liên hệ hỗ trợ ở đâu nếu có vấn đề?",
    answer:
      "Nhắn tin qua Cộng đồng Zalo hoặc Fanpage Facebook. Phản hồi nhanh chóng trong giờ làm việc.",
  },
];
