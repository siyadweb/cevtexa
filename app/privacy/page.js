import ContentPage from "../components/ContentPage";
import { getPageSeo } from "../lib/seo";

export async function generateMetadata() {
  const seo = await getPageSeo("/privacy");

  return {
    title: seo.title,
    description: seo.description,

    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA privacy policy",
            "privacy policy",
            "data privacy",
            "data protection",
            "CEVTEXA data handling",
            "website privacy",
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

export default function Privacy() {
  return (
    <ContentPage
      active=""
      eyebrow="Legal"
      title={
        <>
          Privacy
          <br />
          <em>Policy.</em>
        </>
      }
      intro="How CEVTEXA handles information submitted through this website."
    >
      <section className="section legal-page">
        <h2>Information we collect</h2>
        <p>
          When you submit a project enquiry, we may collect the details you
          provide such as your name, company, email, phone number, project
          requirements and budget information.
        </p>

        <h2>How we use it</h2>
        <p>
          We use submitted information to respond to enquiries, understand
          project requirements, manage our business pipeline and communicate
          about relevant services.
        </p>

        <h2>Data handling</h2>
        <p>
          We aim to limit access to business information to authorized users
          and use access controls provided by our application infrastructure.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions, contact hello@cevtexa.studio.
        </p>
      </section>
    </ContentPage>
  );
}