"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    phase: "DISCOVER",
    title: "Understand the Problem",
    description:
      "We begin by understanding your business, users, goals, challenges, and opportunities before writing a single line of code.",
    deliverables: [
      "Business discovery",
      "Requirement mapping",
      "User & audience analysis",
      "Technical feasibility",
    ],
  },
  {
    number: "02",
    phase: "STRATEGY",
    title: "Design the Direction",
    description:
      "We transform your requirements into a clear digital strategy, product architecture, technology plan, and measurable roadmap.",
    deliverables: [
      "Product strategy",
      "Information architecture",
      "Technology planning",
      "Development roadmap",
    ],
  },
  {
    number: "03",
    phase: "DESIGN",
    title: "Create the Experience",
    description:
      "We design interfaces that are visually distinctive, easy to understand, responsive, and built around the real user journey.",
    deliverables: [
      "UX architecture",
      "UI design",
      "Responsive layouts",
      "Interactive prototypes",
    ],
  },
  {
    number: "04",
    phase: "BUILD",
    title: "Engineer the Product",
    description:
      "Our engineering process turns the approved experience into a scalable, secure, high-performance digital product.",
    deliverables: [
      "Frontend development",
      "Backend systems",
      "Database architecture",
      "API integrations",
    ],
  },
  {
    number: "05",
    phase: "INTELLIGENCE",
    title: "Add Intelligence",
    description:
      "Where it creates real value, we integrate AI, automation, intelligent workflows, analytics, and decision-support systems.",
    deliverables: [
      "AI integrations",
      "Automation workflows",
      "Intelligent agents",
      "Data & analytics",
    ],
  },
  {
    number: "06",
    phase: "GROW",
    title: "Launch & Improve",
    description:
      "Launch is only the beginning. We monitor performance, learn from real usage, and continuously improve the system.",
    deliverables: [
      "Deployment",
      "Performance monitoring",
      "Growth optimization",
      "Continuous improvement",
    ],
  },
];

const principles = [
  {
    icon: "◈",
    title: "Business First",
    text: "Technology follows the business objective, not the other way around.",
  },
  {
    icon: "⌁",
    title: "Built to Scale",
    text: "Architecture is planned for future users, features, integrations, and growth.",
  },
  {
    icon: "✦",
    title: "Human Experience",
    text: "Every system is designed around how real people actually use it.",
  },
  {
    icon: "◎",
    title: "Intelligent by Design",
    text: "Automation and AI are introduced where they create measurable value.",
  },
];

export default function ProcessPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState({});
  const stepRefs = useRef([]);

  useEffect(() => {
    const observers = [];

    stepRefs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps((previous) => ({
              ...previous,
              [index]: true,
            }));

            setActiveStep(index);
          }
        },
        {
          threshold: 0.35,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <main className="process-page">
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

        .process-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(47, 127, 255, 0.12),
              transparent 32%
            ),
            radial-gradient(
              circle at 85% 40%,
              rgba(41, 224, 255, 0.055),
              transparent 25%
            ),
            #05070b;
          overflow: hidden;
        }

        .process-container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .process-hero {
          position: relative;
          min-height: 72vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 150px 0 100px;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.25;
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

        .hero-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(47, 127, 255, 0.14),
            rgba(41, 224, 255, 0.04) 40%,
            transparent 70%
          );
          filter: blur(12px);
          pointer-events: none;
        }

        .eyebrow {
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

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 14px rgba(41, 224, 255, 0.8);
        }

        .hero-title {
          position: relative;
          max-width: 900px;
          margin: 28px auto 0;
          font-size: clamp(48px, 7vw, 92px);
          line-height: 0.98;
          letter-spacing: -0.055em;
          font-weight: 700;
        }

        .hero-title span {
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

        .hero-description {
          position: relative;
          max-width: 680px;
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
            rgba(41, 224, 255, 0),
            rgba(41, 224, 255, 0.8),
            rgba(41, 224, 255, 0)
          );
        }

        .section {
          padding: 110px 0;
        }

        .section-heading {
          max-width: 720px;
          margin-bottom: 70px;
        }

        .section-kicker {
          color: var(--cyan);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          margin-bottom: 16px;
        }

        .section-title {
          margin: 0;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        .section-description {
          margin: 22px 0 0;
          color: var(--body);
          line-height: 1.75;
          font-size: 17px;
        }

        .process-layout {
          position: relative;
          display: grid;
          grid-template-columns: 90px minmax(0, 1fr);
          gap: 40px;
        }

        .timeline {
          position: relative;
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          top: 20px;
          bottom: 20px;
          width: 1px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            rgba(47, 127, 255, 0.05),
            rgba(47, 127, 255, 0.45),
            rgba(41, 224, 255, 0.12)
          );
        }

        .timeline-progress {
          position: absolute;
          left: 50%;
          top: 20px;
          width: 2px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            var(--azure),
            var(--cyan)
          );
          box-shadow: 0 0 15px rgba(41, 224, 255, 0.45);
          transition: height 0.5s ease;
        }

        .timeline-dot {
          position: sticky;
          top: 45vh;
          z-index: 3;
          width: 48px;
          height: 48px;
          margin: 0 auto;
          border: 1px solid rgba(41, 224, 255, 0.35);
          border-radius: 50%;
          background: #07101a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cyan);
          font-size: 11px;
          font-weight: 700;
          box-shadow:
            0 0 0 8px rgba(5, 7, 11, 0.8),
            0 0 30px rgba(41, 224, 255, 0.1);
        }

        .step {
          min-height: 580px;
          display: flex;
          align-items: center;
          padding: 60px 0;
        }

        .step-card {
          width: 100%;
          position: relative;
          padding: 44px;
          border: 1px solid var(--border);
          border-radius: 30px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.018)
            );
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
          opacity: 0;
          transform: translateY(35px);
          transition:
            opacity 0.7s ease,
            transform 0.7s ease,
            border-color 0.4s ease,
            box-shadow 0.4s ease;
        }

        .step-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .step-card.active {
          border-color: rgba(47, 127, 255, 0.3);
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
        }

        .step-number {
          position: absolute;
          top: 28px;
          right: 34px;
          color: rgba(143, 198, 255, 0.16);
          font-size: 70px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.08em;
        }

        .step-phase {
          color: var(--cyan);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .step-title {
          position: relative;
          max-width: 650px;
          margin: 18px 0 18px;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        .step-description {
          max-width: 690px;
          margin: 0;
          color: var(--body);
          font-size: 16px;
          line-height: 1.8;
        }

        .deliverables {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 34px;
          max-width: 700px;
        }

        .deliverable {
          padding: 14px 16px;
          border: 1px solid rgba(255, 255, 255, 0.065);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.025);
          color: #dce2ec;
          font-size: 13px;
        }

        .deliverable::before {
          content: "↗";
          margin-right: 9px;
          color: var(--cyan);
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
            border-color 0.3s ease,
            background 0.3s ease;
        }

        .principle:hover {
          transform: translateY(-6px);
          border-color: rgba(47, 127, 255, 0.28);
          background: rgba(47, 127, 255, 0.035);
        }

        .principle-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(47, 127, 255, 0.08);
          border: 1px solid rgba(47, 127, 255, 0.15);
          color: var(--cyan);
          font-size: 20px;
        }

        .principle h3 {
          margin: 24px 0 10px;
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
          margin: 70px 0 110px;
          padding: 85px 50px;
          overflow: hidden;
          border: 1px solid rgba(47, 127, 255, 0.2);
          border-radius: 32px;
          text-align: center;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(47, 127, 255, 0.14),
              transparent 50%
            ),
            rgba(255, 255, 255, 0.025);
        }

        .cta::before {
          content: "";
          position: absolute;
          width: 400px;
          height: 400px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(41, 224, 255, 0.06);
          border-radius: 50%;
          box-shadow:
            0 0 0 70px rgba(41, 224, 255, 0.015),
            0 0 0 140px rgba(41, 224, 255, 0.01);
          pointer-events: none;
        }

        .cta h2 {
          position: relative;
          margin: 0;
          font-size: clamp(34px, 5vw, 58px);
          letter-spacing: -0.05em;
        }

        .cta p {
          position: relative;
          max-width: 590px;
          margin: 20px auto 32px;
          color: var(--body);
          line-height: 1.7;
        }

        .cta-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 15px 23px;
          border-radius: 999px;
          border: 1px solid rgba(143, 198, 255, 0.3);
          background: linear-gradient(
            135deg,
            rgba(47, 127, 255, 0.9),
            rgba(41, 224, 255, 0.8)
          );
          color: #041018;
          font-weight: 800;
          font-size: 14px;
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
          .process-layout {
            grid-template-columns: 55px minmax(0, 1fr);
            gap: 18px;
          }

          .principles {
            grid-template-columns: repeat(2, 1fr);
          }

          .step {
            min-height: 500px;
          }

          .step-card {
            padding: 34px;
          }
        }

        @media (max-width: 650px) {
          .process-container {
            width: min(100% - 28px, 1180px);
          }

          .process-hero {
            min-height: 68vh;
            padding: 120px 0 70px;
          }

          .hero-description {
            font-size: 15px;
          }

          .section {
            padding: 75px 0;
          }

          .section-heading {
            margin-bottom: 45px;
          }

          .process-layout {
            grid-template-columns: 1fr;
          }

          .timeline {
            display: none;
          }

          .step {
            min-height: auto;
            padding: 12px 0;
          }

          .step-card {
            padding: 30px 24px;
          }

          .step-number {
            top: 22px;
            right: 22px;
            font-size: 52px;
          }

          .deliverables {
            grid-template-columns: 1fr;
          }

          .principles {
            grid-template-columns: 1fr;
          }

          .principle {
            min-height: auto;
          }

          .cta {
            margin: 30px 0 70px;
            padding: 65px 24px;
            border-radius: 24px;
          }
        }
      `}</style>

      <section className="process-hero">
        <div className="hero-grid" />
        <div className="hero-orb" />

        <div className="process-container">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            THE CEVTEXA PROCESS
          </div>

          <h1 className="hero-title">
            From first idea
            <br />
            to <span>intelligent product.</span>
          </h1>

          <p className="hero-description">
            We combine strategy, design, engineering, AI, and growth into one
            connected process designed to turn ambitious ideas into digital
            systems that work.
          </p>

          <div className="hero-line" />
        </div>
      </section>

      <section className="section">
        <div className="process-container">
          <div className="section-heading">
            <div className="section-kicker">HOW WE WORK</div>

            <h2 className="section-title">
              A system built around
              <br />
              <span>clarity and momentum.</span>
            </h2>

            <p className="section-description">
              Every project moves through a deliberate sequence. Each stage
              creates the foundation for the next, reducing unnecessary
              complexity while keeping the final product aligned with the
              original business objective.
            </p>
          </div>

          <div className="process-layout">
            <div className="timeline">
              <div className="timeline-line" />

              <div
                className="timeline-progress"
                style={{
                  height: `${Math.min(
                    100,
                    ((activeStep + 1) / steps.length) * 100
                  )}%`,
                }}
              />

              <div className="timeline-dot">
                {String(activeStep + 1).padStart(2, "0")}
              </div>
            </div>

            <div className="steps">
              {steps.map((step, index) => (
                <article
                  key={step.number}
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                  className="step"
                >
                  <div
                    className={`step-card ${
                      visibleSteps[index] ? "visible" : ""
                    } ${activeStep === index ? "active" : ""}`}
                  >
                    <div className="step-number">{step.number}</div>

                    <div className="step-phase">{step.phase}</div>

                    <h3 className="step-title">{step.title}</h3>

                    <p className="step-description">{step.description}</p>

                    <div className="deliverables">
                      {step.deliverables.map((item) => (
                        <div className="deliverable" key={item}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="process-container">
          <div className="section-heading">
            <div className="section-kicker">OUR PRINCIPLES</div>

            <h2 className="section-title">
              The thinking behind
              <br />
              the technology.
            </h2>

            <p className="section-description">
              The tools may change. The principles remain consistent.
            </p>
          </div>

          <div className="principles">
            {principles.map((principle) => (
              <div className="principle" key={principle.title}>
                <div className="principle-icon">{principle.icon}</div>

                <h3>{principle.title}</h3>

                <p>{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="process-container">
        <section className="cta">
          <h2>Have an idea worth building?</h2>

          <p>
            Tell us what you are trying to create. We will help turn the
            problem into a clear digital direction.
          </p>

          <a className="cta-button" href="/contact">
            Start a conversation
            <span>↗</span>
          </a>
        </section>
      </div>
    </main>
  );
}