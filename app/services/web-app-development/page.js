import { getPageSeo } from "../../lib/seo";
import ContentPage, {
  FeatureGrid,
  SectionIntro,
} from "../../components/ContentPage";

export async function generateMetadata() {
  const seo = await getPageSeo("/services/web-app-development");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "web development",
            "app development",
            "web app development",
            "custom software development",
            "Next.js development",
            "React development",
            "business web applications",
            "booking systems",
            "admin dashboards",
            "API integrations",
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
      eyebrow="BUILD / Web + App Development"
      title={
        <>
          Software that
          <br />
          <em>works in the real world.</em>
        </>
      }
      intro="We build fast, scalable digital products around the way your business actually operates."
    >
      <section className="section page-section">
        <SectionIntro
          eyebrow="Capabilities"
          title="From public experience to internal operations."
        />

        <FeatureGrid
          items={[
            {
              title: "Websites",
              text: "Premium marketing and corporate websites with strong performance and SEO.",
            },
            {
              title: "Web apps",
              text: "Authenticated dashboards, portals, booking systems and customer workflows.",
            },
            {
              title: "Mobile products",
              text: "Mobile-ready product architecture and app experiences for customer and field teams.",
            },
            {
              title: "Commerce",
              text: "Catalogues, checkout, payment integrations, subscriptions and order workflows.",
            },
            {
              title: "Back office",
              text: "Admin panels, permissions, reporting and operational controls.",
            },
            {
              title: "Integrations",
              text: "Supabase, APIs, payments, messaging, analytics and third-party services.",
            },
          ]}
        />
      </section>
    </ContentPage>
  );
}