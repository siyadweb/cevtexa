import { getPageSeo } from "../lib/seo";
import ContentPage, {
  FeatureGrid,
  SectionIntro,
  StatStrip,
} from "../components/ContentPage";

export async function generateMetadata() {
  const seo = await getPageSeo("/about");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA",
            "about CEVTEXA",
            "digital systems studio",
            "software development",
            "AI automation",
            "digital growth",
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

export default function About() {
  return (
    <ContentPage
      active=""
      eyebrow="About"
      title={
        <>
          Technology with
          <br />
          <em>business context.</em>
        </>
      }
      intro="CEVTEXA builds digital systems around how businesses actually operate, grow and compete."
    >
      <section className="section page-section">
        <SectionIntro
          eyebrow="Our belief"
          title="Good technology should make the business better."
        />

        <StatStrip
          items={[
            { value: "BUILD", label: "Digital products" },
            { value: "AI", label: "Intelligent systems" },
            { value: "GROW", label: "Growth infrastructure" },
            { value: "SYSTEM", label: "Connected operations" },
          ]}
        />

        <FeatureGrid
          items={[
            {
              title: "Curious",
              text: "We explore the problem before deciding what technology belongs in the solution.",
            },
            {
              title: "Practical",
              text: "We focus on systems that can be launched, operated and improved in the real world.",
            },
            {
              title: "Connected",
              text: "Web, AI, automation and growth work better when they are designed as one system.",
            },
            {
              title: "Long-term",
              text: "We build foundations that can evolve as the business, users and opportunities change.",
            },
          ]}
        />
      </section>
    </ContentPage>
  );
}