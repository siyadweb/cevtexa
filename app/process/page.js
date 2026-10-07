import { getPageSeo } from "../lib/seo";
import ProcessClient from "./ProcessClient";

export async function generateMetadata() {
  const seo = await getPageSeo("/process");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA process",
            "software development process",
            "web development process",
            "app development process",
            "AI development",
            "digital product development",
            "product strategy",
            "UX UI design",
            "software engineering",
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

export default function ProcessPage() {
  return <ProcessClient />;
}