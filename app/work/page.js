import { getPageSeo } from "../lib/seo";
import WorkClient from "./WorkClient";

export async function generateMetadata() {
  const seo = await getPageSeo("/work");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA portfolio",
            "CEVTEXA projects",
            "web development portfolio",
            "app development portfolio",
            "AI projects",
            "software development projects",
            "digital products",
            "AI automation projects",
            "web application development",
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

export default function WorkPage() {
  return <WorkClient />;
}