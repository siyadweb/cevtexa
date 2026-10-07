import "./globals.css";
import JsonLd from "./components/JsonLd";

const siteUrl = "https://cevtexa.studio";

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "CEVTEXA — Digital Systems That Think Ahead.",
    template: "%s — CEVTEXA",
  },

  description:
    "CEVTEXA designs and builds intelligent websites, applications, AI systems, automation and digital growth platforms.",

  keywords: [
    "CEVTEXA",
    "web development",
    "app development",
    "AI development",
    "AI automation",
    "business automation",
    "digital marketing",
    "digital growth",
    "software development",
    "web applications",
    "AI solutions",
  ],

  authors: [
    {
      name: "CEVTEXA",
      url: siteUrl,
    },
  ],

  creator: "CEVTEXA",
  publisher: "CEVTEXA",
  applicationName: "CEVTEXA",
  category: "technology",

  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    title: "CEVTEXA — Digital Systems That Think Ahead.",
    description:
      "Web, AI, automation and growth systems for ambitious businesses.",
    url: siteUrl,
    siteName: "CEVTEXA",
    type: "website",
    locale: "en_US",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CEVTEXA — Digital Systems That Think Ahead.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CEVTEXA — Digital Systems That Think Ahead.",
    description:
      "Web, AI, automation and growth systems for ambitious businesses.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050a12",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}