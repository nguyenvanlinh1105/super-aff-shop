import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Khu vực riêng tư (yêu cầu đăng nhập) và API — không có giá trị SEO,
        // chặn crawl để tiết kiệm crawl budget.
        disallow: ["/admin", "/app", "/api"],
      },
    ],
    sitemap: "https://meowback.vn/sitemap.xml",
  };
}
