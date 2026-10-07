import { getSupabaseClient } from "./supabase";

const SITE_URL = "https://cevtexa.studio";

const DEFAULT_SEO = {
  title: "CEVTEXA — Digital Systems That Think Ahead.",
  description:
    "CEVTEXA designs and builds intelligent websites, applications, AI systems, automation and digital growth platforms.",
};

export async function getPageSeo(pageSlug) {
  try {
    const supabase = getSupabaseClient();

    const normalizedSlug =
      pageSlug === "/" ? "/" : pageSlug.replace(/^\/+|\/+$/g, "");

    const { data, error } = await supabase
      .from("seo_settings")
      .select(
        "page_slug,title,description,keywords,og_image,canonical_url"
      )
      .eq("page_slug", normalizedSlug)
      .maybeSingle();

    if (error || !data) {
      return {
        title: DEFAULT_SEO.title,
        description: DEFAULT_SEO.description,
        keywords: [],
        canonical: `${SITE_URL}/${normalizedSlug}`.replace(/\/$/, ""),
        ogImage: `${SITE_URL}/og-image.jpg`,
      };
    }

    const title = data.title?.trim() || DEFAULT_SEO.title;

    const description =
      data.description?.trim() || DEFAULT_SEO.description;

    const keywords = data.keywords
      ? data.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean)
      : [];

    const canonical =
      data.canonical_url?.trim() ||
      (normalizedSlug === "/"
        ? SITE_URL
        : `${SITE_URL}/${normalizedSlug}`);

    const ogImage = data.og_image?.trim()
      ? data.og_image.trim().startsWith("http")
        ? data.og_image.trim()
        : `${SITE_URL}${
            data.og_image.trim().startsWith("/")
              ? data.og_image.trim()
              : `/${data.og_image.trim()}`
          }`
      : `${SITE_URL}/og-image.jpg`;

    return {
      title,
      description,
      keywords,
      canonical,
      ogImage,
    };
  } catch (error) {
    console.error("SEO settings error:", error);

    return {
      title: DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      keywords: [],
      canonical: SITE_URL,
      ogImage: `${SITE_URL}/og-image.jpg`,
    };
  }
}