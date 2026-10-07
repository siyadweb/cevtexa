"use client";

import { useMemo, useState } from "react";

const industries = [
  {
    id: "technology",
    number: "01",
    name: "Technology",
    short: "Software, SaaS & AI",
    description:
      "Build intelligent digital products, platforms, automation systems, and AI-powered experiences designed for scale.",
    challenges: [
      "Complex product requirements",
      "Rapid technology changes",
      "Scaling digital infrastructure",
      "Manual operational workflows",
    ],
    solutions: [
      "Web & SaaS platforms",
      "AI applications",
      "Intelligent automation",
      "API & system integrations",
    ],
  },
  {
    id: "real-estate",
    number: "02",
    name: "Real Estate",
    short: "Property & Construction",
    description:
      "Connect property discovery, sales, construction, visualization, and operations through intelligent digital systems.",
    challenges: [
      "Fragmented property data",
      "Manual lead management",
      "Slow customer follow-up",
      "Complex project coordination",
    ],
    solutions: [
      "Property platforms",
      "Lead management systems",
      "AI sales assistants",
      "Construction technology",
    ],
  },
  {
    id: "hospitality",
    number: "03",
    name: "Hospitality",
    short: "Hotels, Resorts & Travel",
    description:
      "Create connected booking, guest experience, marketing, and operational systems for modern hospitality businesses.",
    challenges: [
      "OTA dependency",
      "Manual reservations",
      "Inventory management",
      "Inconsistent guest communication",
    ],
    solutions: [
      "Booking engines",
      "Reservation systems",
      "Guest automation",
      "Digital marketing systems",
    ],
  },
  {
    id: "healthcare",
    number: "04",
    name: "Healthcare",
    short: "Clinics & Health Services",
    description:
      "Design secure digital experiences that simplify patient journeys, appointments, communication, and internal workflows.",
    challenges: [
      "Appointment coordination",
      "Patient communication",
      "Administrative workload",
      "Disconnected systems",
    ],
    solutions: [
      "Appointment platforms",
      "Patient portals",
      "Workflow automation",
      "Communication systems",
    ],
  },
  {
    id: "education",
    number: "05",
    name: "Education",
    short: "Institutions & EdTech",
    description:
      "Build modern education platforms that connect students, educators, administrators, and learning systems.",
    challenges: [
      "Student administration",
      "Manual academic workflows",
      "Communication gaps",
      "Scattered information",
    ],
    solutions: [
      "Student portals",
      "Learning platforms",
      "Management systems",
      "AI education tools",
    ],
  },
  {
    id: "commerce",
    number: "06",
    name: "Commerce",
    short: "E-commerce & Retail",
    description:
      "Build digital commerce experiences that connect customers, products, payments, operations, and growth.",
    challenges: [
      "Low conversion rates",
      "Inventory complexity",
      "Customer retention",
      "Manual operations",
    ],
    solutions: [
      "E-commerce platforms",
      "Customer systems",
      "Automation",
      "Growth analytics",
    ],
  },
  {
    id: "finance",
    number: "07",
    name: "Finance",
    short: "Financial & Professional Services",
    description:
      "Create structured digital systems for financial workflows, customer experiences, data, and business operations.",
    challenges: [
      "Complex workflows",
      "Data fragmentation",
      "Compliance requirements",
      "Manual reporting",
    ],
    solutions: [
      "Business platforms",
      "Workflow automation",
      "Data dashboards",
      "Secure integrations",
    ],
  },
  {
    id: "startups",
    number: "08",
    name: "Startups",
    short: "New Ventures & Innovation",
    description:
      "Turn early-stage ideas into validated digital products with a clear path from MVP to scalable technology.",
    challenges: [
      "Limited resources",
      "Unclear product direction",
      "Fast validation requirements",
      "Scaling after product-market fit",
    ],
    solutions: [
      "MVP development",
      "Product strategy",
      "Rapid prototyping",
      "Scalable architecture",
    ],
  },
];

function Arrow() {
  return <span className="industry-arrow">↗</span>;
}

export default function IndustriesPage() {
  const [activeId, setActiveId] = useState("technology");

  const activeIndustry = useMemo(
    () => industries.find((item) => item.id === activeId) || industries[0],
    [activeId]
  );

  return (
    <main className="industries-page">
      <style jsx global>{`
        :root {
          --azure: #2f7fff;
          --azure-soft: #8fc6ff;
          --azure-deep: #123166;
          --cyan: #29e0ff;
          --cyan-soft: #b6f4ff;
          --bg: #05070b;
          --panel: rgba(255, 255, 255, 0.045);
          --border: rgba(255, 255, 255, 0.09);
          --text: #eceff5;
          --body: #c7cedc;
          --muted: #8b93a6;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: var(--bg);
          color: var(--text);
        }

        .industries-page {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(47, 127, 255, 0.13),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 55%,
              rgba(41, 224, 255, 0.045),
              transparent 25%
            ),
            #05070b;
        }

        .container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .hero {
          position: relative;
          min-height: 72vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 145px 0 100px;
        }

        .grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.23;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 80px 80px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        .orb {
          position: absolute;
          width: 560px;
          height: 560px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(47, 127, 255, 0.14),
            rgba(41, 224, 255, 0.035) 42%,
            transparent 70%
          );
          filter: blur(14px);
          pointer-events: none;
        }

        .eyebrow {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 13px;
          border: 1px solid rgba(143, 198, 255, 0.18);
          border-radius: 999px;
          background: rgba(47, 127, 255, 0.055);
          color: var(--azure-soft);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 14px rgba(41, 224, 255, 0.8);
        }

        .hero h1 {
          position: relative;
          max-width: 950px;
          margin: 28px auto 0;
          font-size: clamp(48px, 7vw, 94px);
          line-height: 0.98;
          letter-spacing: -0.06em;
        }

        .hero h1 span {
          background: linear-gradient(
            110deg,
            #ffffff 10%,
            #8fc6ff 52%,
            #29e0ff 90%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero p {
          position: relative;
          max-width: 690px;
          margin: 30px auto 0;
          color: var(--body);
          font-size: 18px;
          line-height: 1.75;
        }

        .hero-line {
          width: 1px;
          height: 100px;
          margin: 55px auto 0;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(41, 224, 255, 0.8),
            transparent
          );
        }

        .section {
          padding: 100px 0;
        }

        .section-heading {
          max-width: 720px;
          margin-bottom: 60px;
        }

        .kicker {
          margin-bottom: 15px;
          color: var(--cyan);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .section-title {
          margin: 0;
          font-size: clamp(36px, 5vw, 60px);
          line-height: 1.04;
          letter-spacing: -0.05em;
        }

        .section-description {
          margin: 22px 0 0;
          color: var(--body);
          font-size: 17px;
          line-height: 1.75;
        }

        .industry-layout {
          display: grid;
          grid-template-columns: 0.85fr 1.35fr;
          gap: 22px;
          align-items: stretch;
        }

        .industry-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .industry-button {
          position: relative;
          width: 100%;
          padding: 20px 20px;
          border: 1px solid transparent;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.022);
          color: var(--muted);
          cursor: pointer;
          text-align: left;
          transition:
            color 0.25s ease,
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease;
        }

        .industry-button:hover {
          color: var(--text);
          transform: translateX(4px);
        }

        .industry-button.active {
          color: var(--text);
          border-color: rgba(47, 127, 255, 0.25);
          background:
            linear-gradient(
              100deg,
              rgba(47, 127, 255, 0.1),
              rgba(41, 224, 255, 0.025)
            );
        }

        .industry-button-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .industry-number {
          margin-right: 12px;
          color: rgba(143, 198, 255, 0.4);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .industry-name {
          font-size: 15px;
          font-weight: 700;
        }

        .industry-short {
          margin-top: 5px;
          padding-left: 34px;
          color: var(--muted);
          font-size: 12px;
        }

        .industry-arrow {
          color: var(--cyan);
          font-size: 17px;
          transition: transform 0.25s ease;
        }

        .industry-button.active .industry-arrow {
          transform: translate(3px, -3px);
        }

        .industry-detail {
          position: relative;
          min-height: 600px;
          padding: 48px;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 30px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(47, 127, 255, 0.12),
              transparent 38%
            ),
            rgba(255, 255, 255, 0.025);
        }

        .detail-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          right: -120px;
          top: -120px;
          border: 1px solid rgba(41, 224, 255, 0.08);
          border-radius: 50%;
          box-shadow:
            0 0 0 55px rgba(41, 224, 255, 0.015),
            0 0 0 110px rgba(41, 224, 255, 0.01);
        }

        .detail-number {
          position: relative;
          color: rgba(143, 198, 255, 0.2);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .detail-name {
          position: relative;
          margin: 18px 0 5px;
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .detail-short {
          position: relative;
          color: var(--cyan);
          font-size: 13px;
          font-weight: 700;
        }

        .detail-description {
          position: relative;
          max-width: 650px;
          margin: 27px 0 0;
          color: var(--body);
          line-height: 1.8;
          font-size: 16px;
        }

        .detail-columns {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 45px;
          margin-top: 50px;
        }

        .detail-column h3 {
          margin: 0 0 18px;
          color: #ffffff;
          font-size: 12px;
          letter-spacing: 0.15em;
        }

        .detail-column ul {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .detail-column li {
          display: flex;
          gap: 10px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .detail-column li::before {
          content: "↗";
          flex: 0 0 auto;
          color: var(--cyan);
        }

        .industry-count {
          position: absolute;
          right: 45px;
          bottom: 40px;
          color: rgba(143, 198, 255, 0.12);
          font-size: 90px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.08em;
        }

        .capabilities {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .capability {
          min-height: 230px;
          padding: 30px;
          border: 1px solid var(--border);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.025);
          transition:
            transform 0.3s ease,
            border-color 0.3s ease;
        }

        .capability:hover {
          transform: translateY(-6px);
          border-color: rgba(47, 127, 255, 0.28);
        }

        .capability-number {
          color: rgba(143, 198, 255, 0.28);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .capability h3 {
          margin: 30px 0 12px;
          font-size: 19px;
        }

        .capability p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .cta {
          position: relative;
          margin: 30px 0 110px;
          padding: 85px 45px;
          overflow: hidden;
          border: 1px solid rgba(47, 127, 255, 0.2);
          border-radius: 32px;
          text-align: center;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(47, 127, 255, 0.14),
              transparent 52%
            ),
            rgba(255, 255, 255, 0.025);
        }

        .cta h2 {
          position: relative;
          margin: 0;
          font-size: clamp(35px, 5vw, 58px);
          line-height: 1;
          letter-spacing: -0.055em;
        }

        .cta p {
          position: relative;
          max-width: 600px;
          margin: 22px auto 32px;
          color: var(--body);
          line-height: 1.7;
        }

        .cta-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 15px 23px;
          border: 1px solid rgba(143, 198, 255, 0.3);
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            rgba(47, 127, 255, 0.9),
            rgba(41, 224, 255, 0.8)
          );
          color: #041018;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 12px 35px rgba(47, 127, 255, 0.2);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 45px rgba(47, 127, 255, 0.3);
        }

        @media (max-width: 900px) {
          .industry-layout {
            grid-template-columns: 1fr;
          }

          .industry-detail {
            min-height: 520px;
          }

          .capabilities {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .container {
            width: min(100% - 28px, 1180px);
          }

          .hero {
            min-height: 68vh;
            padding: 120px 0 70px;
          }

          .hero p {
            font-size: 15px;
          }

          .section {
            padding: 75px 0;
          }

          .industry-detail {
            min-height: auto;
            padding: 30px 24px 100px;
            border-radius: 24px;
          }

          .detail-columns {
            grid-template-columns: 1fr;
            gap: 30px;
            margin-top: 35px;
          }

          .industry-count {
            right: 24px;
            bottom: 25px;
            font-size: 65px;
          }

          .capabilities {
            grid-template-columns: 1fr;
          }

          .cta {
            margin-bottom: 70px;
            padding: 65px 24px;
            border-radius: 24px;
          }
        }
      `}</style>

      <section className="hero">
        <div className="grid" />
        <div className="orb" />

        <div className="container">
          <div className="eyebrow">
            <span className="dot" />
            INDUSTRIES WE BUILD FOR
          </div>

          <h1>
            Technology shaped
            <br />
            around <span>your industry.</span>
          </h1>

          <p>
            Different industries have different problems. We build digital
            systems around the workflows, customers, data, and opportunities
            that matter to your business.
          </p>

          <div className="hero-line" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div className="kicker">INDUSTRY SYSTEMS</div>

            <h2 className="section-title">
              One technology mindset.
              <br />
              <span>Different business realities.</span>
            </h2>

            <p className="section-description">
              Explore how CEVTEXA approaches digital products, automation, AI,
              and growth across different business environments.
            </p>
          </div>

          <div className="industry-layout">
            <div className="industry-list">
              {industries.map((industry) => (
                <button
                  type="button"
                  key={industry.id}
                  className={`industry-button ${
                    activeId === industry.id ? "active" : ""
                  }`}
                  onClick={() => setActiveId(industry.id)}
                >
                  <div className="industry-button-top">
                    <div>
                      <span className="industry-number">
                        {industry.number}
                      </span>

                      <span className="industry-name">
                        {industry.name}
                      </span>

                      <div className="industry-short">
                        {industry.short}
                      </div>
                    </div>

                    <Arrow />
                  </div>
                </button>
              ))}
            </div>

            <div className="industry-detail" key={activeIndustry.id}>
              <div className="detail-glow" />

              <div className="detail-number">
                INDUSTRY / {activeIndustry.number}
              </div>

              <h3 className="detail-name">{activeIndustry.name}</h3>

              <div className="detail-short">{activeIndustry.short}</div>

              <p className="detail-description">
                {activeIndustry.description}
              </p>

              <div className="detail-columns">
                <div className="detail-column">
                  <h3>COMMON CHALLENGES</h3>

                  <ul>
                    {activeIndustry.challenges.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-column">
                  <h3>WHAT WE BUILD</h3>

                  <ul>
                    {activeIndustry.solutions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="industry-count">
                {activeIndustry.number}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div className="kicker">CORE CAPABILITIES</div>

            <h2 className="section-title">
              The systems behind
              <br />
              <span>modern businesses.</span>
            </h2>

            <p className="section-description">
              Across industries, our work connects the same fundamental
              capabilities into systems that can evolve with the business.
            </p>
          </div>

          <div className="capabilities">
            <div className="capability">
              <div className="capability-number">01 / PRODUCT</div>
              <h3>Digital Products</h3>
              <p>
                Web applications, SaaS platforms, portals, dashboards, and
                customer-facing digital experiences.
              </p>
            </div>

            <div className="capability">
              <div className="capability-number">02 / INTELLIGENCE</div>
              <h3>AI & Automation</h3>
              <p>
                AI assistants, intelligent workflows, agents, automation, and
                decision-support systems.
              </p>
            </div>

            <div className="capability">
              <div className="capability-number">03 / DATA</div>
              <h3>Connected Data</h3>
              <p>
                Structured databases, dashboards, analytics, integrations, and
                information systems.
              </p>
            </div>

            <div className="capability">
              <div className="capability-number">04 / EXPERIENCE</div>
              <h3>Digital Experience</h3>
              <p>
                High-performance websites and interfaces designed around
                clarity, usability, and conversion.
              </p>
            </div>

            <div className="capability">
              <div className="capability-number">05 / OPERATIONS</div>
              <h3>Business Systems</h3>
              <p>
                Internal tools and workflows that reduce repetitive work and
                make business operations easier to manage.
              </p>
            </div>

            <div className="capability">
              <div className="capability-number">06 / GROWTH</div>
              <h3>Digital Growth</h3>
              <p>
                SEO, performance, conversion systems, analytics, content, and
                digital marketing infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="cta">
          <h2>Your industry. Your system.</h2>

          <p>
            Tell us about the business you are building. We will help identify
            where technology, automation, and AI can create the most useful
            digital foundation.
          </p>

          <a className="cta-button" href="/contact">
            Discuss your project
            <span>↗</span>
          </a>
        </section>
      </div>
    </main>
  );
}