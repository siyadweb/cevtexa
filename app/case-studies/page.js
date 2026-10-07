import { getPageSeo } from "../lib/seo";
import ContentPage, {
  FeatureGrid,
  SectionIntro,
} from "../components/ContentPage";

export async function generateMetadata() {
  const seo = await getPageSeo("/case-studies");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA case studies",
            "web development case studies",
            "AI automation case studies",
            "digital product case studies",
            "software development",
            "hospitality technology",
            "booking system",
            "CRM automation",
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

export default function CaseStudies() {
  return (
    <ContentPage
      active=""
      eyebrow="Case studies"
      title={
        <>
          Work that creates
          <br />
          <em>real momentum.</em>
        </>
      }
      intro="A selection of digital systems, intelligent products and growth experiences built around real business needs."
    >
      <section className="section page-section">
        <SectionIntro
          eyebrow="Selected work"
          title="Built for outcomes, not just screenshots."
        />

        <FeatureGrid
          items={[
            {
              title: "Digital products",
              text: "Web applications and platforms designed around real users, workflows and business goals.",
            },
            {
              title: "AI & automation",
              text: "Intelligent workflows that reduce repetitive work and create faster operating systems.",
            },
            {
              title: "Growth systems",
              text: "Digital experiences, analytics and automation connected to measurable growth.",
            },
          ]}
        />
      </section>
    </ContentPage>
  );
}