import { getPageSeo } from "../lib/seo";
import ServicesClient from "./ServicesClient";

export async function generateMetadata() {
  const seo = await getPageSeo("/services");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA services",
            "web development services",
            "web app development",
            "AI automation",
            "AI development",
            "digital growth",
            "business automation",
            "software development",
            "custom software development",
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

export default function ServicesPage() {
  return <ServicesClient />;
}