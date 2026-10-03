import type { MetadataRoute } from "next";

const BASE_URL = "https://meowback.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/register", priority: 0.9, changeFrequency: "monthly" },
    { path: "/uu-dai", priority: 0.9, changeFrequency: "daily" },
    { path: "/cua-hang", priority: 0.8, changeFrequency: "weekly" },
    { path: "/huong-dan", priority: 0.9, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.8, changeFrequency: "weekly" },
    { path: "/login", priority: 0.5, changeFrequency: "yearly" },
    { path: "/dieu-khoan-su-dung", priority: 0.3, changeFrequency: "yearly" },
    { path: "/chinh-sach-bao-mat", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
