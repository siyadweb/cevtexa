export default function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://cevtexa.studio/#organization",
    name: "CEVTEXA",
    url: "https://cevtexa.studio",
    logo: "https://cevtexa.studio/logo.webp",
    description:
      "CEVTEXA designs and builds intelligent websites, applications, AI systems, automation and digital growth platforms.",
    sameAs: [],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://cevtexa.studio/#website",
    url: "https://cevtexa.studio",
    name: "CEVTEXA",
    description:
      "Digital systems, web applications, AI automation and digital growth solutions.",
    publisher: {
      "@id": "https://cevtexa.studio/#organization",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website),
        }}
      />
    </>
  );
}