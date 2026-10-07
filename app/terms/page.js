import ContentPage from "../components/ContentPage";
import { getPageSeo } from "../lib/seo";

export async function generateMetadata() {
  const seo = await getPageSeo("/terms");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA terms",
            "terms of use",
            "website terms",
            "CEVTEXA terms and conditions",
            "website usage terms",
            "service enquiries",
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

export default function Terms() {
  return (
    <ContentPage
      active=""
      eyebrow="Legal"
      title={
        <>
          Terms of
          <br />
          <em>Use.</em>
        </>
      }
      intro="General terms for using the CEVTEXA website and contacting our studio."
    >
      <section className="section legal-page">
        <h2>Website content</h2>
        <p>
          Information on this website is provided for general business and
          informational purposes. Project scope, pricing and delivery terms
          are confirmed separately.
        </p>

        <h2>Enquiries</h2>
        <p>
          Submitting an enquiry does not create a contract or guarantee
          service availability. We may request additional information before
          proposing work.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Unless otherwise stated, website copy, visual systems and original
          materials remain the property of their respective owners.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to hello@cevtexa.studio.
        </p>
      </section>
    </ContentPage>
  );
}