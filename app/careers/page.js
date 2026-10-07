import { getPageSeo } from "../lib/seo";
import CareersClient from "./CareersClient";

export async function generateMetadata() {
  const seo = await getPageSeo("/careers");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA careers",
            "software development jobs",
            "web developer jobs",
            "AI developer jobs",
            "AI automation careers",
            "React developer jobs",
            "Next.js developer jobs",
            "software engineer careers",
            "technology careers",
            "digital product careers",
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

export default function CareersPage() {
  return <CareersClient />;
}