import React from "react";

/**
 * BỘ ICON TÀI CHÍNH & VÍ TIỀN MINH HOẠ ĐA SẮC CAO CẤP (2.5D / FLAT ILLUSTRATION)
 * Được thiết kế riêng theo phong cách đồ hoạ tươi sáng, hiện đại cho MeowBack:
 * 1. IconPaidSuccessBadge: Tiền giấy xanh + đồng xu vàng + dấu tích tròn xanh lá (Đã rút về ví)
 * 2. IconAccumulatedBag: Túi tiền vàng đầy đặn có thắt nơ (Tổng tích luỹ trọn đời)
 * 3. IconPendingHourglass: Đồng hồ cát thời gian trong khối tròn vàng hổ phách (Chờ duyệt / Đối soát)
 * 4. IconAvailableBag: Túi tài lộc xanh ngọc có đồng xu & lấp lánh (Sẵn sàng rút)
 */

interface IconProps {
  className?: string;
  size?: number;
}

// ─── 1. ICON ĐÃ RÚT VỀ VÍ / ĐÃ NHẬN THÀNH CÔNG ───
// (Tiền giấy xanh ngọc + 2 đồng xu vàng + Huy hiệu tròn tích xanh nổi bật)
export function IconPaidSuccessBadge({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <defs>
        {/* Đổ bóng nhẹ */}
        <filter id="paid-shadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#059669" floodOpacity="0.18" />
        </filter>
        {/* Gradient tờ tiền xanh */}
        <linearGradient id="bill-grad" x1="6" y1="10" x2="52" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        {/* Gradient đồng xu vàng */}
        <linearGradient id="coin-grad" x1="28" y1="32" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        {/* Gradient huy hiệu tích xanh */}
        <linearGradient id="check-grad" x1="36" y1="34" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <g filter="url(#paid-shadow)">
        {/* Tờ tiền xoay nghiêng nhẹ tạo chiều sâu 2.5D */}
        <g transform="rotate(-10 28 26)">
          {/* Viền ngoài tiền */}
          <rect
            x="8"
            y="12"
            width="40"
            height="24"
            rx="5"
            fill="url(#bill-grad)"
            stroke="#065F46"
            strokeWidth="2.2"
          />
          {/* Hoạ tiết nét đứt viền trong */}
          <rect
            x="11.5"
            y="15.5"
            width="33"
            height="17"
            rx="3.5"
            fill="none"
            stroke="#A7F3D0"
            strokeWidth="1.2"
            strokeDasharray="2.5 1.5"
          />
          {/* Vòng tròn trung tâm tờ tiền */}
          <circle cx="28" cy="24" r="5" fill="#A7F3D0" stroke="#047857" strokeWidth="1.6" />
          <circle cx="28" cy="24" r="2.2" fill="#059669" />
          {/* Điểm nhấn hai bên tờ tiền */}
          <circle cx="14" cy="24" r="1.8" fill="#D1FAE5" />
          <circle cx="42" cy="24" r="1.8" fill="#D1FAE5" />
        </g>

        {/* Đồng xu vàng số 1 (nằm phía sau) */}
        <circle cx="34" cy="40" r="8.5" fill="#D97706" stroke="#78350F" strokeWidth="1.8" />
        <circle cx="34" cy="40" r="7" fill="url(#coin-grad)" />
        <circle cx="34" cy="40" r="4.8" fill="none" stroke="#FDE68A" strokeWidth="1" strokeDasharray="1.5 1.5" />

        {/* Đồng xu vàng số 2 (nổi phía trước) */}
        <circle cx="26" cy="44" r="8.5" fill="#D97706" stroke="#78350F" strokeWidth="1.8" />
        <circle cx="26" cy="44" r="7" fill="url(#coin-grad)" />
        <circle cx="26" cy="44" r="4.8" fill="none" stroke="#FDE68A" strokeWidth="1" strokeDasharray="1.5 1.5" />
        {/* Ký hiệu đồng xu */}
        <path d="M26 40.5V47.5M24.5 42H27C27.6 42 28 42.4 28 43C28 43.6 27.6 44 27 44H25C24.4 44 24 44.4 24 45C24 45.6 24.4 46 25 46H27.5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />

        {/* Huy hiệu dấu tích xanh lá (Green Verified Badge) */}
        <circle cx="48" cy="45" r="11" fill="#FFFFFF" />
        <circle cx="48" cy="45" r="9.5" fill="url(#check-grad)" stroke="#064E3B" strokeWidth="1.5" />
        {/* Nét dấu tích trắng sắc nét */}
        <path
          d="M43.5 45L46.5 48L52.5 42"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

// ─── 2. ICON TỔNG TÍCH LUỸ / TÚI TIỀN VÀNG TRỌN ĐỜI ───
// (Túi vàng kim căng đầy có thắt nơ + Ký hiệu $ đồng tiền to rõ)
export function IconAccumulatedBag({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <defs>
        <filter id="bag-shadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#B45309" floodOpacity="0.22" />
        </filter>
        <linearGradient id="gold-bag" x1="16" y1="16" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bag-rim" x1="22" y1="12" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      <g filter="url(#bag-shadow)">
        {/* Túi tiền phần thân bầu tròn */}
        <path
          d="M32 20C26 20 22 23 18 29C13 36.5 13 47 18 52.5C22 57 27 58 32 58C37 58 42 57 46 52.5C51 47 51 36.5 46 29C42 23 38 20 32 20Z"
          fill="url(#gold-bag)"
          stroke="#78350F"
          strokeWidth="2.2"
        />

        {/* Nếp gấp nhún miệng túi trên */}
        <path
          d="M24 20C23 15 25 10 32 10C39 10 41 15 40 20C37 22 27 22 24 20Z"
          fill="url(#bag-rim)"
          stroke="#78350F"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Dây thắt miệng túi màu trắng ngà viền nâu */}
        <path
          d="M23 20.5C26 22 38 22 41 20.5"
          stroke="#78350F"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M23 20.5C26 22 38 22 41 20.5"
          stroke="#FEF3C7"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Nơ dây thắt rủ xuống */}
        <ellipse cx="32" cy="21.5" r="2.5" fill="#FEF3C7" stroke="#78350F" strokeWidth="1.2" />
        <path d="M30 23L27 28M34 23L37 28" stroke="#78350F" strokeWidth="1.6" strokeLinecap="round" />

        {/* Ký hiệu Dollar $ trên bụng túi sắc nét */}
        <text
          x="32"
          y="46"
          textAnchor="middle"
          fill="#78350F"
          fontSize="19"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          $
        </text>

        {/* Tia sáng lấp lánh (Sparkle) góc túi */}
        <path d="M49 14L50.5 18L54.5 19.5L50.5 21L49 25L47.5 21L43.5 19.5L47.5 18L49 14Z" fill="#FDE047" stroke="#B45309" strokeWidth="0.8" />
        <path d="M14 26L15 28.5L17.5 29.5L15 30.5L14 33L13 30.5L10.5 29.5L13 28.5L14 26Z" fill="#FDE047" stroke="#B45309" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

// ─── 3. ICON CHỜ DUYỆT / ĐỒNG HỒ CÁT HỔ PHÁCH ───
// (Khối tròn nền vàng mơ nhạt + Đồng hồ cát 3D lung linh đang rơi cát)
export function IconPendingHourglass({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <defs>
        {/* Nền tròn pastel vàng mơ */}
        <linearGradient id="bg-amber-soft" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        {/* Gradient đế gỗ/vàng đồng hồ */}
        <linearGradient id="wood-cap" x1="20" y1="14" x2="44" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        {/* Gradient thuỷ tinh */}
        <linearGradient id="glass-grad" x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Vòng tròn nền pastel vàng hổ phách mềm mại */}
      <circle cx="32" cy="32" r="28" fill="url(#bg-amber-soft)" stroke="#FCD34D" strokeWidth="1.5" />

      {/* Khung thuỷ tinh đồng hồ cát */}
      <path
        d="M21 16H43C43 25 35 28 35 32C35 36 43 39 43 48H21C21 39 29 36 29 32C29 28 21 25 21 16Z"
        fill="url(#glass-grad)"
        stroke="#78350F"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Cát vàng ở bầu trên */}
      <path
        d="M23 18H41C41 23 37 25 34 27C33 27.8 31 27.8 30 27C27 25 23 23 23 18Z"
        fill="#F59E0B"
      />

      {/* Dòng cát đang chảy xuống */}
      <path d="M32 28V38" stroke="#D97706" strokeWidth="2" strokeDasharray="1.5 1.5" strokeLinecap="round" />

      {/* Đụn cát tích luỹ ở bầu dưới */}
      <path
        d="M24 46C24 42 28 39 32 39C36 39 40 42 40 46H24Z"
        fill="#F59E0B"
      />

      {/* Nắp trên đồng hồ */}
      <rect x="18" y="13" width="28" height="5" rx="2.5" fill="url(#wood-cap)" stroke="#78350F" strokeWidth="2.2" />
      {/* Nắp dưới đồng hồ */}
      <rect x="18" y="46" width="28" height="5" rx="2.5" fill="url(#wood-cap)" stroke="#78350F" strokeWidth="2.2" />

      {/* Điểm bóng sáng thuỷ tinh */}
      <path d="M25 20C24 23 25 25 26 26" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 44C24 41 25 39 26 38" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

      {/* Hạt sao lấp lánh trang trí */}
      <circle cx="48" cy="18" r="1.5" fill="#F59E0B" />
      <circle cx="15" cy="42" r="1.2" fill="#F59E0B" />
    </svg>
  );
}

// ─── 4. ICON SẴN SÀNG RÚT / VÍ LỘC XANH NGỌC RÚT TIỀN ───
// (Khối tròn nền xanh mint pastel + Túi tiền vàng đầy đặn có đồng xu tài lộc)
export function IconReadyToWithdraw({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <defs>
        {/* Nền tròn pastel xanh ngọc */}
        <linearGradient id="bg-mint-soft" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D1FAE5" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>
        <linearGradient id="pouch-grad" x1="20" y1="18" x2="44" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Vòng tròn nền pastel xanh mint */}
      <circle cx="32" cy="32" r="28" fill="url(#bg-mint-soft)" stroke="#6EE7B7" strokeWidth="1.5" />

      {/* Túi tiền vàng may mắn */}
      <path
        d="M32 23C27 23 23 26 20 31C16 37 16 45 20 49.5C23 53 27 54 32 54C37 54 41 53 44 49.5C48 45 48 37 44 31C41 26 37 23 32 23Z"
        fill="url(#pouch-grad)"
        stroke="#78350F"
        strokeWidth="2.2"
      />

      {/* Miệng túi loe trên */}
      <path
        d="M25 23C24 19 26 15 32 15C38 15 40 19 39 23C36 24.5 28 24.5 25 23Z"
        fill="#FEF08A"
        stroke="#78350F"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Dây thắt đỏ may mắn */}
      <path d="M25 23.5C27 25 37 25 39 23.5" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="24.5" r="2" fill="#EF4444" stroke="#78350F" strokeWidth="1" />

      {/* Đồng xu vàng đính trên bụng túi */}
      <circle cx="32" cy="39" r="6.5" fill="#FEF08A" stroke="#78350F" strokeWidth="1.6" />
      <text
        x="32"
        y="43.5"
        textAnchor="middle"
        fill="#78350F"
        fontSize="12"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        $
      </text>

      {/* Tia sao lấp lánh (Sparkle) màu xanh lá / vàng kim */}
      <path d="M47 16L48.5 19.5L52 21L48.5 22.5L47 26L45.5 22.5L42 21L45.5 19.5L47 16Z" fill="#10B981" stroke="#047857" strokeWidth="0.8" />
    </svg>
  );
}
