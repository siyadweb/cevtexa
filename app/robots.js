const siteUrl = "https://cevtexa.studio";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
        ],
      },
    ],

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}