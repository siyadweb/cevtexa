import { getPageSeo } from "../lib/seo";
import ContentPage, {
  FeatureGrid,
  SectionIntro,
} from "../components/ContentPage";

export async function generateMetadata() {
  const seo = await getPageSeo("/solutions");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA solutions",
            "digital solutions",
            "business automation",
            "AI solutions",
            "web solutions",
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

export default function Solutions() {
  return (
    <ContentPage
      active=""
      eyebrow="Solutions"
      title={
        <>
          Systems designed
          <br />
          around <em>business problems.</em>
        </>
      }
      intro="From customer-facing experiences to internal automation, we connect technology to the problems that matter."
    >
      <section className="section page-section">
        <SectionIntro
          eyebrow="What we solve"
          title="Technology shaped around the way your business works."
        />

        <FeatureGrid
          items={[
            {
              title: "Digital Experiences",
              text: "High-performance websites and applications that turn attention into meaningful customer experiences.",
            },
            {
              title: "Intelligent Automation",
              text: "AI-powered workflows that reduce repetitive work and help teams operate more efficiently.",
            },
            {
              title: "Business Systems",
              text: "Connected platforms that bring data, operations, customers and teams into one system.",
            },
            {
              title: "Digital Growth",
              text: "Marketing, analytics and conversion systems designed to create measurable growth.",
            },
            {
              title: "AI Products",
              text: "Purpose-built AI products, agents and intelligent interfaces for emerging opportunities.",
            },
            {
              title: "Custom Platforms",
              text: "Scalable software platforms designed around specific business models and operational needs.",
            },
          ]}
        />
      </section>
    </ContentPage>
  );
}