/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Middleware chay tren Edge Runtime, khong tu doc duoc bien moi truong
  // thuong nhu process.env.SESSION_SECRET tu .env luc runtime — phai khai
  // bao o day de Next.js nhung gia tri that vao bundle middleware luc build.
  env: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    // Đóng dấu thời điểm build — dùng làm query-string "?v=" cho vài ảnh
    // hay bị admin thay nội dung nhưng giữ nguyên tên file (logo, ảnh lưu
    // ý...). Ảnh /uploads/ đã có UUID riêng nên không cần cái này; đây chỉ
    // cho các ảnh tĩnh nằm sẵn trong public/ và tái dùng nguyên tên.
    NEXT_PUBLIC_ASSET_VERSION: String(Date.now()),
  },
  // Header bảo mật áp cho toàn bộ route. CSP ở đây CHỈ chặn object/base-tag/
  // form-hijack/frame-embed — cố tình KHÔNG khoá script-src/style-src vì
  // Next.js App Router tự chèn script inline để hydrate (self.__next_f...),
  // khoá sai sẽ sập toàn bộ trang mà không cách nào kiểm tra bằng mắt được
  // trước khi lên production. Muốn siết chặt hơn (script-src theo nonce)
  // cần làm riêng, test kỹ trên bản staging trước.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          {
            key: "Content-Security-Policy",
            value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
