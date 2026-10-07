"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../lib/supabase";

const adminSections = [
  {
    title: "Leads",
    description: "Manage incoming business enquiries and CRM activity.",
    href: "/admin/leads",
    icon: "◈",
  },
  {
    title: "Messages",
    description: "Review contact and website messages.",
    href: "/admin/messages",
    icon: "✉",
  },
  {
    title: "Projects",
    description: "Manage portfolio projects and published work.",
    href: "/admin/projects",
    icon: "◆",
  },
  {
    title: "Case Studies",
    description: "Manage detailed project case studies.",
    href: "/admin/case-studies",
    icon: "▣",
  },
  {
    title: "Services",
    description: "Manage services displayed across the website.",
    href: "/admin/services",
    icon: "◇",
  },
  {
    title: "Blog",
    description: "Create and manage insights and articles.",
    href: "/admin/blog",
    icon: "✦",
  },
  {
    title: "Testimonials",
    description: "Manage client testimonials and reviews.",
    href: "/admin/testimonials",
    icon: "❝",
  },
  {
    title: "Team",
    description: "Manage team members and profiles.",
    href: "/admin/team",
    icon: "◎",
  },
  {
    title: "Careers",
    description: "Manage job openings and applications.",
    href: "/admin/careers",
    icon: "↗",
  },
  {
    title: "Media",
    description: "Manage website images and media assets.",
    href: "/admin/media",
    icon: "▧",
  },
  {
    title: "Pages",
    description: "Manage CMS pages and page content.",
    href: "/admin/pages",
    icon: "□",
  },
  {
    title: "SEO",
    description: "Manage page titles, descriptions and metadata.",
    href: "/admin/seo",
    icon: "⌕",
  },
  {
    title: "Settings",
    description: "Manage global website configuration.",
    href: "/admin/settings",
    icon: "⚙",
  },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const supabase = getSupabaseClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          window.location.replace("/admin/login");
          return;
        }

        setUserEmail(session.user?.email || "");
        setAuthorized(true);
      } catch (error) {
        console.error("Admin authentication error:", error);

        if (mounted) {
          window.location.replace("/admin/login");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session) {
          setAuthorized(false);
          window.location.replace("/admin/login");
          return;
        }

        setUserEmail(session.user?.email || "");
        setAuthorized(true);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const supabase = getSupabaseClient();

      await supabase.auth.signOut();

      window.location.replace("/admin/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loader">
          <div className="loader-ring" />
          <div className="loader-core" />
        </div>

        <h1>CEVTEXA Admin</h1>
        <p>Verifying secure administrator access...</p>

        <style jsx>{styles}</style>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="admin-page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">C</div>

          <div>
            <div className="brand-name">CEVTEXA</div>
            <div className="brand-subtitle">
              ADMIN SYSTEM
            </div>
          </div>
        </div>

        <div className="top-actions">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="view-site"
          >
            View website ↗
          </a>

          <div className="user-box">
            <div className="user-avatar">
              {(userEmail?.[0] || "A").toUpperCase()}
            </div>

            <div className="user-details">
              <strong>Administrator</strong>
              <span>{userEmail}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "..." : "Sign out"}
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="status-dot" />
            CONTROL CENTER
          </div>

          <h1>
            Welcome to your
            <span> command center.</span>
          </h1>

          <p>
            Manage your website, content, leads, projects and
            business operations from one place.
          </p>
        </div>

        <div className="hero-orb">
          <div className="orb-ring ring-one" />
          <div className="orb-ring ring-two" />
          <div className="orb-core">C</div>
        </div>
      </section>

      <section className="overview">
        <div className="section-heading">
          <div>
            <span>WORKSPACE</span>
            <h2>Admin modules</h2>
          </div>

          <div className="module-count">
            {adminSections.length} modules
          </div>
        </div>

        <div className="module-grid">
          {adminSections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              className="module-card"
            >
              <div className="module-top">
                <div className="module-icon">
                  {section.icon}
                </div>

                <span className="module-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3>{section.title}</h3>

              <p>{section.description}</p>

              <div className="module-link">
                Open module
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="security-bar">
        <div className="security-icon">✓</div>

        <div>
          <strong>Secure administrator session</strong>
          <p>
            Your dashboard is connected to Supabase
            Authentication and protected by database-level
            admin policies.
          </p>
        </div>
      </section>

      <footer>
        © {new Date().getFullYear()} CEVTEXA · Admin Control
        Center
      </footer>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .loading-page,
  .admin-page {
    min-height: 100vh;
    background:
      radial-gradient(
        circle at 8% 5%,
        rgba(47, 127, 255, 0.09),
        transparent 27%
      ),
      radial-gradient(
        circle at 90% 90%,
        rgba(41, 224, 255, 0.06),
        transparent 28%
      ),
      #070a10;
    color: #eceff5;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .loading-page {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .loading-page h1 {
    margin: 25px 0 5px;
    font-size: 18px;
  }

  .loading-page p {
    color: #737c8e;
    font-size: 12px;
  }

  .loader {
    width: 58px;
    height: 58px;
    position: relative;
    display: grid;
    place-items: center;
  }

  .loader-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid rgba(47, 127, 255, 0.15);
    border-top-color: #2f7fff;
    border-right-color: #29e0ff;
    animation: spin 0.9s linear infinite;
  }

  .loader-core {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #29e0ff;
    box-shadow: 0 0 18px rgba(41, 224, 255, 0.8);
  }

  .topbar {
    min-height: 78px;
    padding: 0 5%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(7, 10, 16, 0.78);
    backdrop-filter: blur(18px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-mark {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #2f7fff, #29e0ff);
    font-weight: 900;
    box-shadow: 0 8px 25px rgba(47, 127, 255, 0.2);
  }

  .brand-name {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.13em;
  }

  .brand-subtitle {
    color: #6f7788;
    font-size: 8px;
    letter-spacing: 0.18em;
    margin-top: 3px;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .view-site {
    color: #8fc6ff;
    text-decoration: none;
    font-size: 12px;
    font-weight: 600;
  }

  .view-site:hover {
    color: #b6f4ff;
  }

  .user-box {
    display: flex;
    align-items: center;
    gap: 9px;
    padding-left: 18px;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
  }

  .user-avatar {
    width: 33px;
    height: 33px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(47, 127, 255, 0.13);
    border: 1px solid rgba(47, 127, 255, 0.28);
    color: #8fc6ff;
    font-size: 12px;
    font-weight: 800;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-details strong {
    font-size: 10px;
  }

  .user-details span {
    color: #687183;
    font-size: 9px;
  }

  .logout-button {
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.035);
    color: #aab2c0;
    padding: 9px 13px;
    border-radius: 9px;
    cursor: pointer;
    font-size: 11px;
  }

  .logout-button:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.16);
  }

  .hero {
    max-width: 1380px;
    margin: auto;
    padding: 80px 5% 65px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 50px;
  }

  .eyebrow {
    color: #8fc6ff;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.18em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #29e0ff;
    box-shadow: 0 0 12px rgba(41, 224, 255, 0.8);
  }

  .hero h1 {
    max-width: 780px;
    margin: 18px 0 15px;
    font-size: clamp(38px, 6vw, 72px);
    line-height: 0.98;
    letter-spacing: -0.055em;
  }

  .hero h1 span {
    color: #6faeff;
  }

  .hero p {
    max-width: 650px;
    color: #8b93a6;
    line-height: 1.75;
    font-size: 15px;
    margin: 0;
  }

  .hero-orb {
    width: 190px;
    height: 190px;
    flex: 0 0 auto;
    position: relative;
    display: grid;
    place-items: center;
  }

  .orb-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(47, 127, 255, 0.16);
  }

  .ring-one {
    transform: rotate(35deg) scaleY(0.42);
  }

  .ring-two {
    transform: rotate(-35deg) scaleY(0.42);
    border-color: rgba(41, 224, 255, 0.13);
  }

  .orb-core {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background:
      radial-gradient(
        circle at 35% 30%,
        #b6f4ff,
        #2f7fff 38%,
        #123166 72%,
        #070a10
      );
    box-shadow:
      0 0 55px rgba(47, 127, 255, 0.25),
      inset 0 0 25px rgba(255, 255, 255, 0.15);
    font-size: 30px;
    font-weight: 900;
  }

  .overview {
    max-width: 1380px;
    margin: auto;
    padding: 20px 5% 70px;
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    margin-bottom: 25px;
  }

  .section-heading span {
    color: #687183;
    font-size: 9px;
    letter-spacing: 0.18em;
    font-weight: 800;
  }

  .section-heading h2 {
    margin: 7px 0 0;
    font-size: 26px;
    letter-spacing: -0.03em;
  }

  .module-count {
    color: #697386;
    font-size: 11px;
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 13px;
  }

  .module-card {
    min-height: 205px;
    padding: 22px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.025);
    text-decoration: none;
    color: inherit;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .module-card:hover {
    transform: translateY(-3px);
    border-color: rgba(47, 127, 255, 0.3);
    background: rgba(47, 127, 255, 0.045);
  }

  .module-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .module-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    color: #8fc6ff;
    background: rgba(47, 127, 255, 0.08);
    border: 1px solid rgba(47, 127, 255, 0.14);
    font-size: 15px;
  }

  .module-number {
    color: #343c4b;
    font-size: 10px;
    font-weight: 800;
  }

  .module-card h3 {
    margin: 25px 0 8px;
    font-size: 15px;
  }

  .module-card p {
    min-height: 40px;
    color: #737c8e;
    font-size: 11px;
    line-height: 1.6;
    margin: 0;
  }

  .module-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 19px;
    color: #8fc6ff;
    font-size: 10px;
    font-weight: 700;
  }

  .module-link span {
    font-size: 15px;
  }

  .security-bar {
    max-width: 1380px;
    margin: 0 auto 55px;
    padding: 17px 20px;
    width: 90%;
    border: 1px solid rgba(41, 224, 255, 0.1);
    background: rgba(41, 224, 255, 0.025);
    border-radius: 13px;
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .security-icon {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #8de4b7;
    background: rgba(50, 210, 130, 0.08);
    border: 1px solid rgba(50, 210, 130, 0.15);
    font-size: 12px;
  }

  .security-bar strong {
    display: block;
    font-size: 11px;
    margin-bottom: 3px;
  }

  .security-bar p {
    color: #687183;
    font-size: 10px;
    margin: 0;
    line-height: 1.5;
  }

  footer {
    padding: 0 5% 30px;
    text-align: center;
    color: #3f4654;
    font-size: 9px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .module-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 800px) {
    .topbar {
      padding: 0 20px;
    }

    .view-site,
    .user-details {
      display: none;
    }

    .user-box {
      border-left: 0;
      padding-left: 0;
    }

    .hero {
      padding-top: 55px;
    }

    .hero-orb {
      width: 130px;
      height: 130px;
    }

    .orb-core {
      width: 65px;
      height: 65px;
      font-size: 22px;
    }

    .module-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .topbar {
      min-height: 68px;
    }

    .hero {
      flex-direction: column;
      align-items: flex-start;
      padding: 50px 20px 45px;
    }

    .hero-orb {
      align-self: center;
    }

    .overview {
      padding-left: 20px;
      padding-right: 20px;
    }

    .module-grid {
      grid-template-columns: 1fr;
    }

    .module-card {
      min-height: 175px;
    }

    .security-bar {
      width: calc(100% - 40px);
    }
  }
`;