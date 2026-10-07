import { getPageSeo } from "../lib/seo";
import IndustriesClient from "./IndustriesClient";

export async function generateMetadata() {
  const seo = await getPageSeo("/industries");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA industries",
            "technology solutions",
            "real estate technology",
            "hospitality technology",
            "healthcare technology",
            "education technology",
            "ecommerce solutions",
            "AI automation",
            "digital transformation",
          ],

    alternates: {
      canonical: seo.canonical,
    },

    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      siteName: "CEVTEXA",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function IndustriesPage() {
  return <IndustriesClient />;
}