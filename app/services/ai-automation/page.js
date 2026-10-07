import { getPageSeo } from "../../lib/seo";
import ContentPage, {
  FeatureGrid,
  SectionIntro,
} from "../../components/ContentPage";

export async function generateMetadata() {
  const seo = await getPageSeo("/services/ai-automation");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "AI automation",
            "AI development",
            "AI agents",
            "AI automation services",
            "business automation",
            "AI assistants",
            "workflow automation",
            "document intelligence",
            "internal AI copilots",
            "AI strategy",
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
      eyebrow="INTELLIGENCE / AI + Automation"
      title={
        <>
          Make the system
          <br />
          <em>think with you.</em>
        </>
      }
      intro="Practical AI systems that connect models to your data, tools and business rules."
    >
      <section className="section page-section">
        <SectionIntro
          eyebrow="Capabilities"
          title="AI where it creates leverage."
        />

        <FeatureGrid
          items={[
            {
              title: "AI agents",
              text: "Agents that research, classify, draft, route and execute bounded tasks.",
            },
            {
              title: "Customer assistants",
              text: "Website and support experiences grounded in your products, policies and knowledge.",
            },
            {
              title: "Workflow automation",
              text: "Automate lead handling, reporting, notifications, follow-ups and repetitive operations.",
            },
            {
              title: "Document intelligence",
              text: "Extract structured information from forms, documents and business records.",
            },
            {
              title: "Internal copilots",
              text: "Give teams faster access to context, summaries and next actions.",
            },
            {
              title: "AI strategy",
              text: "Identify high-value use cases, define guardrails and build a practical roadmap.",
            },
          ]}
        />
      </section>
    </ContentPage>
  );
}