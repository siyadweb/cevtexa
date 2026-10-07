"use client";

import { useState } from "react";

const products = [
  {
    id: "homic",
    number: "01",
    type: "PRODUCT",
    status: "IN DEVELOPMENT",
    title: "HOMIC",
    subtitle: "AI-powered real estate intelligence",
    description:
      "A connected platform designed to bring property discovery, AI-assisted planning, construction workflows, visualization, and professional services into one intelligent ecosystem.",
    capabilities: [
      "AI property intelligence",
      "Property discovery",
      "Home planning",
      "Construction support",
      "3D visualization",
      "Professional services",
    ],
    accent: "blue",
  },
  {
    id: "agents",
    number: "02",
    type: "AI SYSTEM",
    status: "ACTIVE LAB",
    title: "AgentOS",
    subtitle: "Intelligent agents for business",
    description:
      "A framework for designing AI agents that can understand business context, connect to tools, automate repetitive workflows, and assist teams with everyday operations.",
    capabilities: [
      "AI agents",
      "Business automation",
      "Tool integrations",
      "Workflow orchestration",
      "Knowledge systems",
      "Decision support",
    ],
    accent: "cyan",
  },
  {
    id: "growth",
    number: "03",
    type: "GROWTH SYSTEM",
    status: "LAB",
    title: "Growth Engine",
    subtitle: "A connected digital growth system",
    description:
      "An experimental operating layer that connects content, SEO, campaigns, analytics, customer journeys, and automation into a measurable growth workflow.",
    capabilities: [
      "SEO intelligence",
      "Content systems",
      "Campaign workflows",
      "Lead automation",
      "Analytics",
      "Conversion systems",
    ],
    accent: "violet",
  },
  {
    id: "vision",
    number: "04",
    type: "EXPERIMENT",
    status: "RESEARCH",
    title: "Vision Lab",
    subtitle: "Interfaces beyond the screen",
    description:
      "Research into spatial interfaces, 3D visualization, computer vision, interactive environments, and new ways for people to experience digital information.",
    capabilities: [
      "3D interfaces",
      "Spatial experiences",
      "AR concepts",
      "Computer vision",
      "Interactive environments",
      "Visual intelligence",
    ],
    accent: "blue",
  },
];

const principles = [
  {
    number: "01",
    title: "Solve real problems",
    text: "Every experiment starts with a practical problem rather than technology for its own sake.",
  },
  {
    number: "02",
    title: "Prototype quickly",
    text: "Ideas become useful when they can be tested, measured, and improved in the real world.",
  },
  {
    number: "03",
    title: "Connect systems",
    text: "The future of business software is increasingly about connected systems rather than isolated tools.",
  },
  {
    number: "04",
    title: "Keep learning",
    text: "Technology changes continuously, so our labs are designed for continuous experimentation.",
  },
];

function ProductVisual({ product }) {
  return (
    <div className={`product-visual ${product.accent}`}>
      <div className="visual-grid" />
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <div className="visual-core">
        <span>{product.number}</span>
      </div>

      <div className="visual-node node-one">AI</div>
      <div className="visual-node node-two">DATA</div>
      <div className="visual-node node-three">SYSTEM</div>
    </div>
  );
}

export default function ProductsPage() {
  const [activeProduct, setActiveProduct] = useState(products[0]);

  return (
    <main className="products-page">
      <style jsx global>{`
        :root {
          --azure: #2f7fff;
          --azure-soft: #8fc6ff;
          --azure-deep: #123166;
          --cyan: #29e0ff;
          --cyan-soft: #b6f4ff;
          --bg: #05070b;
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

        .products-page {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(47, 127, 255, 0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 55%,
              rgba(41, 224, 255, 0.04),
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

        .hero-grid {
          position: absolute;
          inset: 0;
          opacity: 0.23;
          pointer-events: none;
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
          mask-image: linear-gradient(to bottom, black, transparent 88%);
        }

        .hero-orb {
          position: absolute;
          width: 560px;
          height: 560px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(47, 127, 255, 0.13),
            rgba(41, 224, 255, 0.035) 42%,
            transparent 70%
          );
          filter: blur(15px);
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
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 14px rgba(41, 224, 255, 0.8);
        }

        .hero h1 {
          position: relative;
          max-width: 980px;
          margin: 28px auto 0;
          font-size: clamp(50px, 7vw, 94px);
          line-height: 0.96;
          letter-spacing: -0.06em;
        }

        .hero h1 span {
          background: linear-gradient(
            110deg,
            #ffffff 10%,
            #8fc6ff 50%,
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
          padding: 105px 0;
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

        .product-shell {
          display: grid;
          grid-template-columns: 0.72fr 1.28fr;
          gap: 18px;
          align-items: stretch;
        }

        .product-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-button {
          position: relative;
          width: 100%;
          padding: 23px;
          border: 1px solid transparent;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.022);
          color: var(--muted);
          text-align: left;
          cursor: pointer;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease,
            color 0.25s ease;
        }

        .product-button:hover {
          transform: translateX(4px);
          color: var(--text);
        }

        .product-button.active {
          border-color: rgba(47, 127, 255, 0.25);
          background: rgba(47, 127, 255, 0.055);
          color: #fff;
        }

        .product-button-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .product-number {
          color: rgba(143, 198, 255, 0.38);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .product-button h3 {
          margin: 8px 0 5px;
          font-size: 18px;
        }

        .product-button p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .product-status {
          white-space: nowrap;
          padding: 6px 8px;
          border: 1px solid rgba(41, 224, 255, 0.14);
          border-radius: 999px;
          color: var(--cyan);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .product-arrow {
          margin-top: 14px;
          color: var(--cyan);
          font-size: 18px;
          transition: transform 0.25s ease;
        }

        .product-button.active .product-arrow {
          transform: translate(3px, -3px);
        }

        .product-detail {
          position: relative;
          min-height: 670px;
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 30px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.025);
        }

        .product-info {
          position: relative;
          padding: 28px 20px 10px;
        }

        .detail-type {
          color: var(--cyan);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .product-info h2 {
          margin: 12px 0 6px;
          font-size: clamp(38px, 5vw, 60px);
          line-height: 1;
          letter-spacing: -0.055em;
        }

        .detail-subtitle {
          color: var(--azure-soft);
          font-size: 14px;
        }

        .detail-description {
          max-width: 680px;
          margin: 23px 0 0;
          color: var(--body);
          font-size: 15px;
          line-height: 1.8;
        }

        .capabilities {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 28px;
        }

        .capability {
          padding: 13px 15px;
          border: 1px solid rgba(255, 255, 255, 0.065);
          border-radius: 11px;
          color: #dce2ec;
          background: rgba(255, 255, 255, 0.02);
          font-size: 12px;
        }

        .capability::before {
          content: "↗";
          margin-right: 8px;
          color: var(--cyan);
        }

        .product-visual {
          position: relative;
          height: 285px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 21px;
          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(47, 127, 255, 0.13),
              transparent 43%
            ),
            #070c13;
        }

        .product-visual.cyan {
          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(41, 224, 255, 0.12),
              transparent 43%
            ),
            #070c13;
        }

        .product-visual.violet {
          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(125, 105, 255, 0.11),
              transparent 43%
            ),
            #070c13;
        }

        .visual-grid {
          position: absolute;
          inset: 0;
          opacity: 0.28;
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
          background-size: 42px 42px;
        }

        .visual-orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 260px;
          height: 100px;
          border: 1px solid rgba(41, 224, 255, 0.22);
          border-radius: 50%;
          transform: translate(-50%, -50%) rotate(-22deg);
          animation: orbit 7s linear infinite;
        }

        .orbit-two {
          width: 170px;
          height: 250px;
          transform: translate(-50%, -50%) rotate(55deg);
          animation-duration: 9s;
          animation-direction: reverse;
        }

        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        .visual-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 78px;
          height: 78px;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(143, 198, 255, 0.35);
          border-radius: 24px;
          background:
            radial-gradient(
              circle at 35% 25%,
              rgba(255, 255, 255, 0.16),
              rgba(47, 127, 255, 0.08)
            ),
            rgba(7, 16, 27, 0.92);
          box-shadow:
            0 0 35px rgba(47, 127, 255, 0.18),
            inset 0 0 20px rgba(41, 224, 255, 0.05);
          z-index: 3;
        }

        .visual-core span {
          color: #fff;
          font-size: 12px;
          font-weight: 800;
        }

        .visual-node {
          position: absolute;
          z-index: 4;
          padding: 6px 8px;
          border: 1px solid rgba(41, 224, 255, 0.15);
          border-radius: 7px;
          background: rgba(4, 10, 16, 0.8);
          color: var(--cyan);
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .node-one {
          left: 17%;
          top: 27%;
        }

        .node-two {
          right: 16%;
          top: 30%;
        }

        .node-three {
          left: 42%;
          bottom: 15%;
        }

        .principles {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .principle {
          min-height: 220px;
          padding: 30px;
          border: 1px solid var(--border);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.025);
          transition:
            transform 0.3s ease,
            border-color 0.3s ease;
        }

        .principle:hover {
          transform: translateY(-6px);
          border-color: rgba(47, 127, 255, 0.28);
        }

        .principle-number {
          color: rgba(143, 198, 255, 0.3);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .principle h3 {
          margin: 30px 0 12px;
          font-size: 18px;
        }

        .principle p {
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
          font-size: 13px;
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

        @media (max-width: 950px) {
          .product-shell {
            grid-template-columns: 1fr;
          }

          .product-detail {
            min-height: auto;
          }

          .principles {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 620px) {
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

          .product-detail {
            padding: 18px;
            border-radius: 24px;
          }

          .product-info {
            padding: 22px 8px 8px;
          }

          .capabilities {
            grid-template-columns: 1fr;
          }

          .product-visual {
            height: 230px;
          }

          .principles {
            grid-template-columns: 1fr;
          }

          .principle {
            min-height: auto;
          }

          .cta {
            margin-bottom: 70px;
            padding: 65px 24px;
            border-radius: 24px;
          }
        }
      `}</style>

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-orb" />

        <div className="container">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            CEVTEXA LABS
          </div>

          <h1>
            We don't just build
            <br />
            <span>for today.</span>
          </h1>

          <p>
            Our labs are where ideas become experiments, experiments become
            products, and new technology becomes useful systems for the real
            world.
          </p>

          <div className="hero-line" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div className="kicker">PRODUCTS & EXPERIMENTS</div>

            <h2 className="section-title">
              Technology we're
              <br />
              <span>building forward.</span>
            </h2>

            <p className="section-description">
              These are selected products, frameworks, and experiments from
              the CEVTEXA ecosystem. Some are being developed into products;
              others are research directions.
            </p>
          </div>

          <div className="product-shell">
            <div className="product-list">
              {products.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className={`product-button ${
                    activeProduct.id === product.id ? "active" : ""
                  }`}
                  onClick={() => setActiveProduct(product)}
                >
                  <div className="product-button-top">
                    <div>
                      <div className="product-number">
                        {product.number} / {product.type}
                      </div>

                      <h3>{product.title}</h3>

                      <p>{product.subtitle}</p>
                    </div>

                    <div className="product-status">
                      {product.status}
                    </div>
                  </div>

                  <div className="product-arrow">↗</div>
                </button>
              ))}
            </div>

            <div className="product-detail">
              <ProductVisual product={activeProduct} />

              <div className="product-info">
                <div className="detail-type">{activeProduct.type}</div>

                <h2>{activeProduct.title}</h2>

                <div className="detail-subtitle">
                  {activeProduct.subtitle}
                </div>

                <p className="detail-description">
                  {activeProduct.description}
                </p>

                <div className="capabilities">
                  {activeProduct.capabilities.map((item) => (
                    <div className="capability" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div className="kicker">LAB PHILOSOPHY</div>

            <h2 className="section-title">
              Exploration with
              <br />
              <span>a purpose.</span>
            </h2>
          </div>

          <div className="principles">
            {principles.map((principle) => (
              <div className="principle" key={principle.number}>
                <div className="principle-number">
                  {principle.number} / PRINCIPLE
                </div>

                <h3>{principle.title}</h3>

                <p>{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="cta">
          <h2>Have an idea to explore?</h2>

          <p>
            We work with businesses and founders to turn ambitious ideas into
            prototypes, products, and intelligent digital systems.
          </p>

          <a href="/contact" className="cta-button">
            Start a conversation
            <span>↗</span>
          </a>
        </section>
      </div>
    </main>
  );
}