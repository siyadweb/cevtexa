import Link from "next/link";
import SiteChrome from "../components/SiteChrome";
import { getPageSeo } from "../lib/seo";

export async function generateMetadata() {
  const seo = await getPageSeo("/services");

  return {
    title: seo.title,
    description: seo.description,
    keywords:
      seo.keywords.length > 0
        ? seo.keywords
        : [
            "CEVTEXA services",
            "web development",
            "app development",
            "AI automation",
            "digital growth",
            "software development",
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

const engines = [
  {
    number: "01",
    key: "build",
    title: "BUILD",
    tag: "Software systems",
    text: "Websites, applications and digital platforms engineered around the way your business actually works.",
    href: "/services/web-app-development",
    capabilities: [
      "Web development",
      "App development",
      "Portals & dashboards",
      "Integrations",
    ],
  },
  {
    number: "02",
    key: "intelligence",
    title: "INTELLIGENCE",
    tag: "AI systems",
    text: "AI agents, automation and knowledge workflows that turn repetitive work into intelligent systems.",
    href: "/services/ai-automation",
    capabilities: [
      "AI agents",
      "Workflow automation",
      "Knowledge systems",
      "Data workflows",
    ],
  },
  {
    number: "03",
    key: "grow",
    title: "GROW",
    tag: "Growth systems",
    text: "Acquisition, conversion and business development systems designed to keep the pipeline moving.",
    href: "/services/digital-growth",
    capabilities: [
      "SEO & acquisition",
      "Content systems",
      "Conversion",
      "Business development",
    ],
  },
];

const buildDetails = [
  [
    "Web platforms",
    "Marketing sites, SaaS interfaces, e-commerce and content platforms with strong performance and SEO foundations.",
  ],
  [
    "Applications",
    "Customer portals, booking systems, dashboards, marketplaces and internal tools built around real workflows.",
  ],
  [
    "Product design",
    "Information architecture, UX, UI systems and interaction design that make complex products easier to use.",
  ],
  [
    "Integrations",
    "Payments, CRMs, messaging, analytics, maps and external APIs connected into one dependable system.",
  ],
];

const intelligenceDetails = [
  [
    "AI agents",
    "Task-specific agents for research, customer support, operations, internal knowledge and business workflows.",
  ],
  [
    "Automation",
    "Trigger-based workflows across forms, email, CRM, messaging and internal processes with clear handoffs.",
  ],
  [
    "Knowledge systems",
    "Context-aware assistants and searchable business knowledge built around the information your team already owns.",
  ],
  [
    "Data workflows",
    "Collect, transform and surface useful signals so teams can spend less time moving data and more time acting on it.",
  ],
];

const growthDetails = [
  [
    "Acquisition",
    "Search, social and content systems aligned to the customers, markets and commercial goals that matter.",
  ],
  [
    "Conversion",
    "Landing pages, offers and enquiry flows designed to reduce friction between attention and action.",
  ],
  [
    "CRM & follow-up",
    "Lead capture, qualification, pipeline visibility and follow-up systems that keep opportunities moving.",
  ],
  [
    "Optimization",
    "Measure what happens after the click and continuously improve the system around real performance data.",
  ],
];

function DetailGrid({ items }) {
  return (
    <div className="services-detail-grid">
      {items.map(([title, text], index) => (
        <article className="services-detail-card" key={title}>
          <span className="services-detail-index">
            0{index + 1}
          </span>

          <h3>{title}</h3>

          <p>{text}</p>

          <span className="services-detail-line" />
        </article>
      ))}
    </div>
  );
}

function EngineVisual() {
  return (
    <div
      className="three-engine-visual"
      aria-label="CEVTEXA three engine system"
    >
      <div className="engine-grid" />
      <div className="engine-aura" />

      <div className="engine-orbit engine-orbit-a" />
      <div className="engine-orbit engine-orbit-b" />
      <div className="engine-orbit engine-orbit-c" />

      <span className="engine-pulse pulse-a" />
      <span className="engine-pulse pulse-b" />
      <span className="engine-pulse pulse-c" />

      <div className="engine-core">
        <span className="engine-core-ring" />
        <strong>CE</strong>
        <small>CORE</small>
      </div>

      <Link
        className="engine-node engine-node-build"
        href="/services/web-app-development"
      >
        <b>01</b>
        <strong>BUILD</strong>
        <span>Web · Apps · Platforms</span>
      </Link>

      <Link
        className="engine-node engine-node-ai"
        href="/services/ai-automation"
      >
        <b>02</b>
        <strong>INTELLIGENCE</strong>
        <span>AI · Agents · Automation</span>
      </Link>

      <Link
        className="engine-node engine-node-grow"
        href="/services/digital-growth"
      >
        <b>03</b>
        <strong>GROW</strong>
        <span>Marketing · Scale · Revenue</span>
      </Link>

      <div className="engine-caption">
        ONE SYSTEM · THREE ENGINES · CONTINUOUS MOTION
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <SiteChrome active="Services">
      {/* HERO */}

      <section className="services-hero">
        <div className="services-hero-bg" />

        <div className="services-hero-copy">
          <div className="section-kicker">
            <span />
            What we build
          </div>

          <span className="services-index-label">
            01 — 03 / SERVICE SYSTEM
          </span>

          <h1>
            One studio.
            <br />
            <em>Three engines.</em>
          </h1>

          <p>
            CEVTEXA connects software, intelligence and growth into
            one continuous system — so what you launch can keep
            learning, converting and improving after day one.
          </p>

          <div className="services-hero-actions">
            <Link className="btn-main" href="/contact">
              Start a project <span>↗</span>
            </Link>

            <a className="btn-secondary" href="#engines">
              Explore the engines <span>↓</span>
            </a>
          </div>

          <div className="services-hero-meta">
            <span>
              <b>03</b>
              Core disciplines
            </span>

            <span>
              <b>∞</b>
              Built to evolve
            </span>
          </div>
        </div>

        <EngineVisual />
      </section>

      {/* THREE ENGINES */}

      <section
        id="engines"
        className="section services-engines-section"
      >
        <div className="services-section-heading">
          <div>
            <div className="section-kicker">
              <span />
              The system
            </div>

            <h2>
              Three disciplines.
              <br />
              <em>One connected workflow.</em>
            </h2>
          </div>

          <p>
            Each engine can stand alone, but the real value appears
            when product, intelligence and growth share the same
            strategy, data and operating rhythm.
          </p>
        </div>

        <div className="services-engine-cards">
          {engines.map((engine) => (
            <Link
              className={`services-engine-card ${engine.key}`}
              href={engine.href}
              key={engine.number}
            >
              <div className="services-engine-card-top">
                <span>{engine.number}</span>
                <span>↗</span>
              </div>

              <div
                className="services-engine-art"
                aria-hidden="true"
              >
                <div className="art-ring ring-1" />
                <div className="art-ring ring-2" />

                <div className="art-core">
                  <span>
                    {engine.key === "intelligence"
                      ? "AI"
                      : engine.key === "build"
                      ? "CE"
                      : "∞"}
                  </span>
                </div>

                {Array.from({
                  length: engine.key === "grow" ? 7 : 5,
                }).map((_, index) => (
                  <i
                    key={index}
                    className={`engine-art-node node-${index + 1}`}
                  />
                ))}
              </div>

              <span className="services-engine-tag">
                {engine.tag}
              </span>

              <h3>{engine.title}</h3>

              <p>{engine.text}</p>

              <div className="services-capability-row">
                {engine.capabilities.map((capability) => (
                  <span key={capability}>
                    {capability}
                  </span>
                ))}
              </div>

              <div className="services-card-link">
                Explore {engine.title.toLowerCase()}
                <span>↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BUILD */}

      <section className="section service-detail-section">
        <div className="service-detail-head">
          <div className="section-kicker">
            <span />
            01 / Build
          </div>

          <h2>
            Digital products that feel like{" "}
            <em>part of the business.</em>
          </h2>

          <p>
            From a focused marketing site to a full operational
            platform, we design the interface and engineer the
            system behind it.
          </p>
        </div>

        <DetailGrid items={buildDetails} />

        <Link
          className="text-link services-inline-link"
          href="/services/web-app-development"
        >
          Explore Web & App Development <span>↗</span>
        </Link>
      </section>

      {/* INTELLIGENCE */}

      <section className="section service-detail-section service-detail-alt">
        <div className="service-detail-head">
          <div className="section-kicker">
            <span />
            02 / Intelligence
          </div>

          <h2>
            Turn repetitive work into{" "}
            <em>intelligent workflows.</em>
          </h2>

          <p>
            We connect models, data and business rules into
            practical systems rather than novelty chatbots.
          </p>
        </div>

        <DetailGrid items={intelligenceDetails} />

        <Link
          className="text-link services-inline-link"
          href="/services/ai-automation"
        >
          Explore AI & Automation <span>↗</span>
        </Link>
      </section>

      {/* GROW */}

      <section className="section service-detail-section">
        <div className="service-detail-head">
          <div className="section-kicker">
            <span />
            03 / Grow
          </div>

          <h2>
            Build a pipeline,{" "}
            <em>not just a campaign.</em>
          </h2>

          <p>
            Acquisition, conversion and business development work
            better when they share the same operating system.
          </p>
        </div>

        <DetailGrid items={growthDetails} />

        <Link
          className="text-link services-inline-link"
          href="/services/digital-growth"
        >
          Explore Digital Growth <span>↗</span>
        </Link>
      </section>

      {/* CONNECTED SYSTEM */}

      <section className="section services-operating-section">
        <div className="services-operating-card">
          <div>
            <div className="section-kicker">
              <span />
              How the engines connect
            </div>

            <h2>
              Strategy → Design → Engineering → Intelligence →{" "}
              <em>Growth.</em>
            </h2>
          </div>

          <div className="services-operating-flow">
            <span>IDEA</span>
            <i>→</i>
            <span>BUILD</span>
            <i>→</i>
            <span>INTELLIGENCE</span>
            <i>→</i>
            <span>GROW</span>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}