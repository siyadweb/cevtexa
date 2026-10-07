import { getPageSeo } from "../../lib/seo";
import ContentPage, {
  FeatureGrid,
  SectionIntro,
} from "../../components/ContentPage";

export async function generateMetadata() {
  const seo = await getPageSeo("/services/digital-growth");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "digital marketing",
            "digital growth",
            "SEO services",
            "paid media",
            "social media marketing",
            "lead generation",
            "business development",
            "CRM automation",
            "digital analytics",
            "growth marketing",
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

export default function Page() {
  return (
    <ContentPage
      active="Services"
      eyebrow="GROW / Digital Growth"
      title={
        <>
          Growth with a
          <br />
          <em>system behind it.</em>
        </>
      }
      intro="Connect acquisition, conversion, CRM and follow-up so growth becomes a repeatable operating system."
    >
      <section className="section page-section">
        <SectionIntro
          eyebrow="Capabilities"
          title="The full path from attention to revenue."
        />

        <FeatureGrid
          items={[
            {
              title: "SEO",
              text: "Technical foundations, content structure and search visibility.",
            },
            {
              title: "Paid media",
              text: "Search and social campaigns with landing and tracking systems.",
            },
            {
              title: "Social content",
              text: "Creative systems that make consistent publishing easier.",
            },
            {
              title: "Lead generation",
              text: "High-intent forms, funnels, qualification and CRM capture.",
            },
            {
              title: "Business development",
              text: "Prospecting workflows and follow-up systems for outbound growth.",
            },
            {
              title: "Analytics",
              text: "Clear reporting around traffic, enquiries, conversion and pipeline.",
            },
          ]}
        />
      </section>
    </ContentPage>
  );
}