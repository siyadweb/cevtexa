import ContentPage, { SectionIntro } from "../components/ContentPage";
import ContactForm from "../components/ContactForm";
import { getPageSeo } from "../lib/seo";

export async function generateMetadata() {
  const seo = await getPageSeo("/contact");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA contact",
            "web development company",
            "app development company",
            "AI development company",
            "AI automation company",
            "software development services",
            "digital transformation",
            "digital growth services",
            "custom software development",
            "hire web developers",
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

export default function Contact() {
  return (
    <ContentPage
      active="Contact"
      eyebrow="Start something"
      title={
        <>
          Have a system
          <br />
          <em>worth building?</em>
        </>
      }
      intro="Tell us what you’re working on. We’ll turn the rough idea into a clear next step."
      cta={false}
    >
      <section className="section page-section contact-layout">
        <div>
          <SectionIntro
            eyebrow="Project enquiry"
            title="Give us the context."
            text="The more we understand about the business, the better we can shape the first conversation."
          />

          <div className="contact-details">
            <a href="mailto:hello@cevtexa.studio">
              hello@cevtexa.studio
            </a>
            <span>Web · AI · Automation · Growth</span>
            <span>Remote / Global</span>
          </div>
        </div>

        <ContactForm />
      </section>
    </ContentPage>
  );
}