import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/packages",
    "/commissioning",
    "/discovery",
    "/testimonials",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];
  return routes.map((path) => ({
    url: `${siteConfig.siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
