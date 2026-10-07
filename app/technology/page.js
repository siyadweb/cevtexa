import { getPageSeo } from "../lib/seo";
import ContentPage, {
  FeatureGrid,
  SectionIntro,
} from "../components/ContentPage";

export async function generateMetadata() {
  const seo = await getPageSeo("/technology");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA technology",
            "Next.js development",
            "React development",
            "Supabase",
            "PostgreSQL",
            "AI development",
            "AI agents",
            "Three.js",
            "API integrations",
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

export default function Technology() {
  return (
    <ContentPage
      active=""
      eyebrow="Technology"
      title={
        <>
          A modern stack for
          <br />
          <em>real products.</em>
        </>
      }
      intro="We choose technology around the product and operating context—not the other way around."
    >
      <section className="section page-section">
        <SectionIntro
          eyebrow="Core stack"
          title="Composable, maintainable and production-ready."
        />

        <FeatureGrid
          items={[
            {
              title: "Next.js + React",
              text: "Modern web applications, server rendering and component-driven experiences.",
            },
            {
              title: "Supabase + Postgres",
              text: "Authentication, relational data, storage and row-level security.",
            },
            {
              title: "AI platforms",
              text: "LLM APIs, retrieval, agents, structured outputs and workflow automation.",
            },
            {
              title: "Three.js",
              text: "Web-native 3D and interactive visual systems when they add value.",
            },
            {
              title: "Analytics",
              text: "Event tracking and conversion measurement connected to business goals.",
            },
            {
              title: "APIs + integrations",
              text: "Payments, messaging, maps, CRM and external business services.",
            },
          ]}
        />
      </section>
    </ContentPage>
  );
}