import { getPageSeo } from "../lib/seo";
import TeamClient from "./TeamClient";

export async function generateMetadata() {
  const seo = await getPageSeo("/team");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA team",
            "CEVTEXA developers",
            "software development team",
            "AI development team",
            "web development team",
            "app development team",
            "AI automation experts",
            "digital product team",
            "technology team",
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

export default function TeamPage() {
  return <TeamClient />;
}