"use client";

import { useEffect, useRef, useState } from "react";
import { initLivingHero } from "./lib/livingHero";
import { getSupabaseClient } from "./lib/supabase";

const services = [
  {
    n: "01",
    title: "BUILD",
    text: "Websites, applications & digital platforms",
    tag: "Software systems",
  },
  {
    n: "02",
    title: "INTELLIGENCE",
    text: "AI solutions, agents & intelligent automation",
    tag: "AI systems",
  },
  {
    n: "03",
    title: "GROW",
    text: "Digital marketing, strategy & business growth",
    tag: "Growth systems",
  },
];

const work = [
  {
    title: "Nature Bliss",
    meta: "Resort platform · Booking system",
    type: "HOSPITALITY",
    visual: "resort",
  },
  {
    title: "HOMIC",
    meta: "Real estate · AI integration",
    type: "PRODUCT",
    visual: "homic",
  },
  {
    title: "Edu Portal",
    meta: "College management · Web app",
    type: "EDTECH",
    visual: "edu",
  },
];

const processSteps = [
  {
    title: "Discover",
    text: "Understand the business, users and opportunity.",
  },
  {
    title: "Design",
    text: "Turn insight into a focused product direction.",
  },
  {
    title: "Build",
    text: "Engineer the experience, platform and intelligence.",
  },
  {
    title: "Launch",
    text: "Ship, measure and make the system real.",
  },
  {
    title: "Scale",
    text: "Optimize, automate and expand what works.",
  },
];

const initialContact = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  service_required: "Web Development",
  project_description: "",
  budget_range: "",
  expected_timeline: "",
};

export default function Home() {
  const canvasRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [contact, setContact] = useState(initialContact);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    const cleanup = initLivingHero(canvasRef.current);

    return cleanup;
  }, []);

  function updateContact(field, value) {
    setContact(function (current) {
      return {
        ...current,
        [field]: value,
      };
    });
  }

  async function submitContact(event) {
    event.preventDefault();

    setContactLoading(true);
    setContactStatus("");
    setContactError("");

    try {
      const supabase = getSupabaseClient();

      const fullName = contact.full_name.trim();
      const email = contact.email.trim().toLowerCase();
      const phone = contact.phone.trim() || null;
      const company = contact.company.trim() || null;
      const service = contact.service_required || null;
      const description =
        contact.project_description.trim();
      const budget = contact.budget_range || null;
      const timeline =
        contact.expected_timeline || null;

      /*
       * --------------------------------------------------
       * 1. CREATE CRM LEAD
       * --------------------------------------------------
       */

      const leadData = {
        full_name: fullName,
        email,
        phone,
        company,
        service_required: service,
        project_description: description,
        budget_range: budget,
        expected_timeline: timeline,
        lead_source: "website",
        status: "new",
        priority: "normal",
      };

      const leadResult = await supabase
        .from("leads")
        .insert(leadData);

      if (leadResult.error) {
        console.error(
          "CEVTEXA lead error:",
          leadResult.error
        );

        throw new Error(
          "We couldn't submit your enquiry. Please try again."
        );
      }

      /*
       * --------------------------------------------------
       * 2. CREATE CONTACT MESSAGE
       * --------------------------------------------------
       */

      const messageResult = await supabase
  .from("contact_messages")
  .insert({
    name: fullName,
    email,
    phone,
    subject: service
      ? `${service} enquiry from ${fullName}`
      : `New enquiry from ${fullName}`,
    message: description,
    status: "new",
  });

if (messageResult.error) {
  console.error(
    "CONTACT_MESSAGES INSERT ERROR:",
    messageResult.error
  );

  throw new Error(
    `Message inbox error: ${
      messageResult.error.message ||
      "Unable to save message."
    }`
  );
}

      if (messageResult.error) {
        console.error(
          "CEVTEXA contact message error:",
          messageResult.error
        );

        throw new Error(
          "Your enquiry was received, but the message inbox could not be updated. Please contact us directly."
        );
      }

      /*
       * --------------------------------------------------
       * 3. SUCCESS
       * --------------------------------------------------
       */

      setContact(initialContact);

      setContactStatus(
        "Your enquiry has been received. We'll get back to you shortly."
      );
    } catch (error) {
      console.error(
        "Contact submission error:",
        error
      );

      setContactError(
        error && error.message
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setContactLoading(false);
    }
  }

  return (
    <main>
      {/* ================= NAVIGATION ================= */}

      <header className="site-nav">
        <a
          className="brand"
          href="#top"
          aria-label="CEVTEXA home"
        >
          <img src="/logo.webp" alt="" />
          <span>CEVTEXA</span>
        </a>

        <nav
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          <a className="active" href="#top">
            Home
          </a>

          <a href="#services">
            Services
          </a>

          <a href="#work">
            Work
          </a>

          <a href="#about">
            About
          </a>

          <a href="#process">
            Process
          </a>

          <a href="#insights">
            Insights
          </a>

          <a href="#contact">
            Contact
          </a>
        </nav>

        <a
          className="nav-cta"
          href="#contact"
        >
          Start a project <span>↗</span>
        </a>

        <button
          className={
            "mobile-menu-button " +
            (menuOpen ? "open" : "")
          }
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={function () {
            setMenuOpen(!menuOpen);
          }}
        >
          <i />
          <i />
        </button>
      </header>

      {/* ================= MOBILE MENU ================= */}

      <div
        className={
          "mobile-menu " +
          (menuOpen ? "open" : "")
        }
      >
        <a
          href="#top"
          onClick={function () {
            setMenuOpen(false);
          }}
        >
          Home <span>↗</span>
        </a>

        <a
          href="#services"
          onClick={function () {
            setMenuOpen(false);
          }}
        >
          Services <span>↗</span>
        </a>

        <a
          href="#work"
          onClick={function () {
            setMenuOpen(false);
          }}
        >
          Work <span>↗</span>
        </a>

        <a
          href="#about"
          onClick={function () {
            setMenuOpen(false);
          }}
        >
          About <span>↗</span>
        </a>

        <a
          href="#process"
          onClick={function () {
            setMenuOpen(false);
          }}
        >
          Process <span>↗</span>
        </a>

        <a
          href="#insights"
          onClick={function () {
            setMenuOpen(false);
          }}
        >
          Insights <span>↗</span>
        </a>

        <a
          href="#contact"
          onClick={function () {
            setMenuOpen(false);
          }}
        >
          Contact <span>↗</span>
        </a>
      </div>

      {/* ================= HERO ================= */}

      <section
        id="top"
        className="hero-new"
      >
        <div className="hero-grid" />

        <div className="hero-orb-glow" />

        <canvas
          ref={canvasRef}
          className="living-canvas"
          aria-label="Animated CEVTEXA neural bloom visual"
        />

        <div className="hero-copy">
          <div className="eyebrow-pill">
            <span className="live-dot" />
            AI <i>×</i> SOFTWARE <i>×</i>{" "}
            AUTOMATION <i>×</i> DIGITAL GROWTH
          </div>

          <h1>
            Digital Systems
            <br />
            That <em>Think Ahead.</em>
          </h1>

          <p>
            We design, build, and automate
            intelligent websites, applications
            and business systems that help
            companies grow faster in a connected
            world.
          </p>

          <div className="hero-actions">
            <a
              className="btn-main"
              href="#contact"
            >
              Start a project <span>→</span>
            </a>

            <a
              className="btn-secondary"
              href="#work"
            >
              See our work <span>▶</span>
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>01</strong>
              <span>Strategy to system</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Core disciplines</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>Built to evolve</span>
            </div>
          </div>
        </div>

        <div className="hero-system-label label-idea">
          <b>IDEA</b>
          <span>
            Strategy · Research · Planning
          </span>
        </div>

        <div className="hero-system-label label-intel">
          <b>INTELLIGENCE</b>
          <span>
            AI · Agents · Automation
          </span>
        </div>

        <div className="hero-system-label label-build">
          <b>BUILD</b>
          <span>
            Design · Develop · Integrate
          </span>
        </div>

        <div className="hero-system-label label-grow">
          <b>GROW</b>
          <span>
            Marketing · Optimization · Scale
          </span>
        </div>

        <div className="scroll-cue">
          <span>↓</span> Scroll to explore
        </div>
      </section>

      {/* ================= SERVICES ================= */}

      <section
        id="services"
        className="section services-section"
      >
        <div className="section-kicker">
          <span /> What we build
        </div>

        <div className="section-head">
          <h2>
            One studio.
            <br />
            <em>Three engines.</em>
          </h2>

          <p>
            From the first idea to a system that
            keeps improving, CEVTEXA connects
            design, technology and growth into
            one continuous workflow.
          </p>
        </div>

        <div className="service-grid">
          {services.map(function (item) {
            let coreClass = "three";

            if (item.n === "01") {
              coreClass = "one";
            }

            if (item.n === "02") {
              coreClass = "two";
            }

            return (
              <article
                className="service-card"
                key={item.n}
              >
                <div className="service-top">
                  <span>{item.n}</span>
                  <span className="arrow">
                    ↗
                  </span>
                </div>

                <div className="service-art">
                  <div
                    className={
                      "service-art-core " +
                      coreClass
                    }
                  />
                </div>

                <div className="service-bottom">
                  <span className="service-tag">
                    {item.tag}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= WORK ================= */}

      <section
        id="work"
        className="section work-section"
      >
        <div className="section-kicker">
          <span /> Selected work
        </div>

        <div className="section-head work-head">
          <h2>
            Work that moves
            <br />
            <em>business forward.</em>
          </h2>

          <a
            className="text-link"
            href="#contact"
          >
            View all projects <span>→</span>
          </a>
        </div>

        <div className="work-grid-new">
          {work.map(function (item) {
            return (
              <article
                className="work-card-new"
                key={item.title}
              >
                <div
                  className={
                    "work-visual " +
                    item.visual
                  }
                >
                  <div className="visual-window">
                    <div className="window-dots">
                      <i />
                      <i />
                      <i />
                    </div>

                    <div className="visual-lines" />

                    <div className="visual-panel" />
                  </div>
                </div>

                <div className="work-info">
                  <span>{item.type}</span>

                  <h3>{item.title}</h3>

                  <p>{item.meta}</p>

                  <a
                    href="#contact"
                    aria-label={
                      "Discuss " +
                      item.title
                    }
                  >
                    ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      <section
        id="about"
        className="section about-new"
      >
        <div className="about-visual">
          <div className="orbit-ring r1" />
          <div className="orbit-ring r2" />

          <div className="about-core">
            <span>CE</span>
          </div>

          <div className="about-node n1">
            AI
          </div>

          <div className="about-node n2">
            WEB
          </div>

          <div className="about-node n3">
            GROW
          </div>
        </div>

        <div className="about-copy">
          <div className="section-kicker">
            <span /> Why CEVTEXA
          </div>

          <h2>
            We don&apos;t hand you
            <br />
            <em>a deliverable.</em>
          </h2>

          <p>
            We build the connected system behind
            it. Strategy, product, intelligence
            and growth are designed to work
            together from day one.
          </p>

          <div className="about-points">
            <div>
              <b>01</b>
              <span>
                Think beyond the brief
              </span>
            </div>

            <div>
              <b>02</b>
              <span>
                Build for the next version
              </span>
            </div>

            <div>
              <b>03</b>
              <span>
                Keep the system moving
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}

      <section
        id="process"
        className="section process-new"
      >
        <div className="section-kicker">
          <span /> The way we work
        </div>

        <div className="section-head">
          <h2>
            From signal
            <br />
            <em>to system.</em>
          </h2>

          <p>
            A clear five-stage process keeps
            creative ambition grounded in
            measurable progress.
          </p>
        </div>

        <div className="process-track">
          {processSteps.map(
            function (step, index) {
              return (
                <div
                  className="process-item"
                  key={step.title}
                >
                  <div className="process-number">
                    0{index + 1}
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.text}</p>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* ================= INSIGHTS ================= */}

      <section
        id="insights"
        className="section insights-new"
      >
        <div className="section-kicker">
          <span /> Insights
        </div>

        <div className="insight-band">
          <div>
            <h2>
              Ideas worth
              <br />
              <em>building.</em>
            </h2>

            <p>
              Notes on AI, software, digital
              growth and the systems connecting
              them.
            </p>
          </div>

          <a
            className="btn-secondary"
            href="#contact"
          >
            Explore insights <span>→</span>
          </a>
        </div>
      </section>

      {/* ================= CONTACT ================= */}

      <section
        id="contact"
        className="section contact-new"
      >
        <div className="contact-panel">
          <div className="contact-copy-new">
            <div className="section-kicker">
              <span /> Start something
            </div>

            <h2>
              Have a system
              <br />
              <em>worth building?</em>
            </h2>

            <p>
              Tell us what you&apos;re working on.
              We&apos;ll turn the rough idea into a
              clear next step.
            </p>

            <div className="contact-direct">
              <span>Prefer email?</span>

              <a href="mailto:hello@cevtexa.studio">
                hello@cevtexa.studio
              </a>
            </div>
          </div>

          <form
            className="contact-form-new"
            onSubmit={submitContact}
          >
            <div className="form-row-new">
              <label>
                Name *

                <input
                  type="text"
                  required
                  value={contact.full_name}
                  onChange={function (
                    event
                  ) {
                    updateContact(
                      "full_name",
                      event.target.value
                    );
                  }}
                  placeholder="Your name"
                />
              </label>

              <label>
                Email *

                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={function (
                    event
                  ) {
                    updateContact(
                      "email",
                      event.target.value
                    );
                  }}
                  placeholder="you@company.com"
                />
              </label>
            </div>

            <div className="form-row-new">
              <label>
                Phone

                <input
                  type="tel"
                  value={contact.phone}
                  onChange={function (
                    event
                  ) {
                    updateContact(
                      "phone",
                      event.target.value
                    );
                  }}
                  placeholder="+91..."
                />
              </label>

              <label>
                Company

                <input
                  type="text"
                  value={contact.company}
                  onChange={function (
                    event
                  ) {
                    updateContact(
                      "company",
                      event.target.value
                    );
                  }}
                  placeholder="Company name"
                />
              </label>
            </div>

            <div className="form-row-new">
              <label>
                Service

                <select
                  value={
                    contact.service_required
                  }
                  onChange={function (
                    event
                  ) {
                    updateContact(
                      "service_required",
                      event.target.value
                    );
                  }}
                >
                  <option>
                    Web Development
                  </option>

                  <option>
                    App Development
                  </option>

                  <option>
                    AI & Automation
                  </option>

                  <option>
                    Digital Marketing
                  </option>

                  <option>
                    Business Development
                  </option>

                  <option>
                    Custom Software
                  </option>

                  <option>
                    Other
                  </option>
                </select>
              </label>

              <label>
                Budget

                <select
                  value={
                    contact.budget_range
                  }
                  onChange={function (
                    event
                  ) {
                    updateContact(
                      "budget_range",
                      event.target.value
                    );
                  }}
                >
                  <option value="">
                    Select range
                  </option>

                  <option>
                    Under $1,000
                  </option>

                  <option>
                    $1,000 – $5,000
                  </option>

                  <option>
                    $5,000 – $10,000
                  </option>

                  <option>
                    $10,000+
                  </option>

                  <option>
                    Not decided
                  </option>
                </select>
              </label>
            </div>

            <label>
              Project description *

              <textarea
                required
                rows="5"
                value={
                  contact.project_description
                }
                onChange={function (
                  event
                ) {
                  updateContact(
                    "project_description",
                    event.target.value
                  );
                }}
                placeholder="What are you trying to build?"
              />
            </label>

            <label>
              Expected timeline

              <select
                value={
                  contact.expected_timeline
                }
                onChange={function (
                  event
                ) {
                  updateContact(
                    "expected_timeline",
                    event.target.value
                  );
                }}
              >
                <option value="">
                  Select timeline
                </option>

                <option>
                  ASAP
                </option>

                <option>
                  Within 1 month
                </option>

                <option>
                  1–3 months
                </option>

                <option>
                  3–6 months
                </option>

                <option>
                  Just exploring
                </option>
              </select>
            </label>

            <button
              className="btn-main contact-submit-new"
              type="submit"
              disabled={contactLoading}
            >
              {contactLoading
                ? "Sending..."
                : "Send project enquiry"}

              <span>→</span>
            </button>

            {contactStatus ? (
              <div
                className="contact-success"
                aria-live="polite"
              >
                ✓ {contactStatus}
              </div>
            ) : null}

            {contactError ? (
              <div
                className="contact-error"
                aria-live="polite"
              >
                {contactError}
              </div>
            ) : null}
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/logo.webp" alt="" />
          <span>CEVTEXA</span>
        </div>

        <p>
          Beyond Intelligence.
        </p>

        <div>
          <a href="#top">
            Back to top ↑
          </a>
        </div>
      </footer>
    </main>
  );
}