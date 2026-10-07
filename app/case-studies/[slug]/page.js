"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [caseStudy, setCaseStudy] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    async function loadCaseStudy() {
      try {
        setLoading(true);
        setError("");

        const supabase = getSupabaseClient();

        const { data, error: caseStudyError } = await supabase
          .from("case_studies")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();

        if (caseStudyError) {
          throw caseStudyError;
        }

        if (!data) {
          setCaseStudy(null);
          return;
        }

        setCaseStudy(data);

        if (data.project_id) {
          const { data: projectData } = await supabase
            .from("projects")
            .select("*")
            .eq("id", data.project_id)
            .maybeSingle();

          setProject(projectData || null);
        }
      } catch (err) {
        console.error("Case study loading error:", err);
        setError("Unable to load this case study.");
      } finally {
        setLoading(false);
      }
    }

    loadCaseStudy();
  }, [slug]);

  if (loading) {
    return (
      <main className="case-detail-page">
        <style jsx global>{styles}</style>

        <div className="loading-screen">
          <div className="loading-orb" />
          <div className="loading-text">LOADING CASE STUDY</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="case-detail-page">
        <style jsx global>{styles}</style>

        <div className="state-screen">
          <div className="state-code">ERROR</div>
          <h1>Something went wrong.</h1>
          <p>{error}</p>

          <Link href="/case-studies" className="back-button">
            ← Back to Case Studies
          </Link>
        </div>
      </main>
    );
  }

  if (!caseStudy) {
    return (
      <main className="case-detail-page">
        <style jsx global>{styles}</style>

        <div className="state-screen">
          <div className="state-code">404</div>
          <h1>Case study not found.</h1>
          <p>
            The case study may have been removed, unpublished, or the URL may
            be incorrect.
          </p>

          <Link href="/case-studies" className="back-button">
            ← View Case Studies
          </Link>
        </div>
      </main>
    );
  }

  const projectUrl =
    project?.url ||
    project?.project_url ||
    project?.website_url ||
    project?.live_url ||
    "";

  return (
    <main className="case-detail-page">
      <style jsx global>{styles}</style>

      <section className="detail-hero">
        <div className="hero-grid" />
        <div className="hero-glow" />

        <div className="detail-container">
          <Link href="/case-studies" className="back-link">
            ← Back to Case Studies
          </Link>

          <div className="hero-label">
            <span />
            CASE STUDY
          </div>

          <h1>{caseStudy.title}</h1>

          {project?.industry && (
            <div className="industry-label">{project.industry}</div>
          )}

          {project?.description && (
            <p className="hero-description">{project.description}</p>
          )}

          <div className="hero-meta">
            {project?.client_name && (
              <div className="meta-item">
                <span>CLIENT</span>
                <strong>{project.client_name}</strong>
              </div>
            )}

            {project?.year && (
              <div className="meta-item">
                <span>YEAR</span>
                <strong>{project.year}</strong>
              </div>
            )}

            {project?.category && (
              <div className="meta-item">
                <span>CATEGORY</span>
                <strong>{project.category}</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {caseStudy.cover_image && (
        <section className="cover-section">
          <div className="detail-container">
            <div className="cover-frame">
              <img
                src={caseStudy.cover_image}
                alt={caseStudy.title}
              />
              <div className="cover-overlay" />
            </div>
          </div>
        </section>
      )}

      <section className="content-section">
        <div className="detail-container">
          <div className="content-layout">
            <aside className="content-sidebar">
              <div className="sidebar-label">PROJECT</div>

              <div className="sidebar-line" />

              <div className="sidebar-title">
                {caseStudy.title}
              </div>

              {projectUrl && (
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link"
                >
                  Visit project
                  <span>↗</span>
                </a>
              )}
            </aside>

            <div className="case-content">
              {caseStudy.challenge && (
                <StorySection
                  number="01"
                  label="THE CHALLENGE"
                  title="Where the journey began."
                  text={caseStudy.challenge}
                />
              )}

              {caseStudy.solution && (
                <StorySection
                  number="02"
                  label="THE SOLUTION"
                  title="Turning complexity into a system."
                  text={caseStudy.solution}
                />
              )}

              {caseStudy.results && (
                <StorySection
                  number="03"
                  label="THE RESULTS"
                  title="What changed."
                  text={caseStudy.results}
                />
              )}

              {caseStudy.content && (
                <section className="story-section full-story">
                  <div className="story-number">04</div>

                  <div className="story-label">THE STORY</div>

                  <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{
                      __html: caseStudy.content,
                    }}
                  />
                </section>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="next-section">
        <div className="detail-container">
          <div className="next-card">
            <div className="next-glow" />

            <div className="next-label">NEXT PROJECT</div>

            <h2>
              Have a digital
              <br />
              system in mind?
            </h2>

            <p>
              Let's turn your idea, challenge, or opportunity into something
              people can actually use.
            </p>

            <Link href="/contact" className="cta-button">
              Start a conversation
              <span>↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function StorySection({ number, label, title, text }) {
  return (
    <section className="story-section">
      <div className="story-number">{number}</div>

      <div className="story-label">{label}</div>

      <h2>{title}</h2>

      <div className="story-text">
        {text.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

const styles = `
  :root {
    --azure: #2f7fff;
    --azure-soft: #8fc6ff;
    --cyan: #29e0ff;
    --bg: #05070b;
    --panel: rgba(255,255,255,.035);
    --border: rgba(255,255,255,.09);
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

  .case-detail-page {
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 50% 0%,
        rgba(47,127,255,.11),
        transparent 30%
      ),
      #05070b;
  }

  .detail-container {
    width: min(1180px, calc(100% - 40px));
    margin: 0 auto;
  }

  .detail-hero {
    position: relative;
    min-height: 75vh;
    display: flex;
    align-items: center;
    padding: 150px 0 100px;
  }

  .hero-grid {
    position: absolute;
    inset: 0;
    opacity: .22;
    pointer-events: none;
    background-image:
      linear-gradient(
        rgba(255,255,255,.035) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(255,255,255,.035) 1px,
        transparent 1px
      );
    background-size: 80px 80px;
    mask-image: linear-gradient(
      to bottom,
      black,
      transparent 90%
    );
  }

  .hero-glow {
    position: absolute;
    width: 650px;
    height: 650px;
    left: 50%;
    top: 20%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(47,127,255,.12),
      rgba(41,224,255,.035) 40%,
      transparent 70%
    );
    filter: blur(20px);
    pointer-events: none;
  }

  .back-link {
    position: relative;
    display: inline-flex;
    color: var(--muted);
    text-decoration: none;
    font-size: 13px;
    transition: color .25s ease;
  }

  .back-link:hover {
    color: var(--cyan);
  }

  .hero-label {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 70px;
    color: var(--cyan);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .2em;
  }

  .hero-label span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 15px rgba(41,224,255,.8);
  }

  .detail-hero h1 {
    position: relative;
    max-width: 1000px;
    margin: 20px 0 0;
    font-size: clamp(50px, 8vw, 100px);
    line-height: .95;
    letter-spacing: -.06em;
  }

  .industry-label {
    position: relative;
    display: inline-block;
    margin-top: 25px;
    padding: 8px 13px;
    border: 1px solid rgba(143,198,255,.18);
    border-radius: 999px;
    color: var(--azure-soft);
    background: rgba(47,127,255,.05);
    font-size: 12px;
  }

  .hero-description {
    position: relative;
    max-width: 680px;
    margin: 27px 0 0;
    color: var(--body);
    font-size: 17px;
    line-height: 1.75;
  }

  .hero-meta {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 50px;
    margin-top: 55px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .meta-item span {
    color: var(--muted);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .17em;
  }

  .meta-item strong {
    color: #fff;
    font-size: 13px;
  }

  .cover-section {
    padding: 0 0 100px;
  }

  .cover-frame {
    position: relative;
    min-height: 400px;
    max-height: 700px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 30px;
    background: #090d14;
  }

  .cover-frame img {
    display: block;
    width: 100%;
    max-height: 700px;
    object-fit: cover;
  }

  .cover-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(
        to bottom,
        transparent 60%,
        rgba(5,7,11,.35)
      );
  }

  .content-section {
    padding: 80px 0 120px;
  }

  .content-layout {
    display: grid;
    grid-template-columns: 250px minmax(0,1fr);
    gap: 100px;
  }

  .content-sidebar {
    position: relative;
  }

  .sidebar-label {
    color: var(--cyan);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .18em;
  }

  .sidebar-line {
    width: 45px;
    height: 1px;
    margin: 18px 0;
    background: rgba(41,224,255,.5);
  }

  .sidebar-title {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .project-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 25px;
    color: var(--azure-soft);
    text-decoration: none;
    font-size: 12px;
    font-weight: 700;
  }

  .project-link span {
    color: var(--cyan);
  }

  .story-section {
    padding: 0 0 95px;
    margin-bottom: 25px;
    border-bottom: 1px solid var(--border);
  }

  .story-number {
    margin-bottom: 16px;
    color: rgba(143,198,255,.28);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .16em;
  }

  .story-label {
    color: var(--cyan);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .2em;
  }

  .story-section h2 {
    max-width: 700px;
    margin: 17px 0 25px;
    font-size: clamp(32px,4vw,48px);
    line-height: 1.05;
    letter-spacing: -.045em;
  }

  .story-text {
    max-width: 750px;
  }

  .story-text p {
    margin: 0 0 18px;
    color: var(--body);
    font-size: 16px;
    line-height: 1.9;
  }

  .full-story {
    border-bottom: 0;
  }

  .rich-content {
    max-width: 750px;
    color: var(--body);
    font-size: 16px;
    line-height: 1.9;
  }

  .rich-content p {
    margin: 0 0 22px;
  }

  .rich-content h2,
  .rich-content h3,
  .rich-content h4 {
    margin: 35px 0 15px;
    color: #fff;
  }

  .rich-content ul,
  .rich-content ol {
    margin: 20px 0;
    padding-left: 22px;
  }

  .rich-content li {
    margin: 8px 0;
  }

  .rich-content a {
    color: var(--azure-soft);
  }

  .next-section {
    padding: 0 0 110px;
  }

  .next-card {
    position: relative;
    overflow: hidden;
    padding: 90px 50px;
    border: 1px solid rgba(47,127,255,.2);
    border-radius: 32px;
    text-align: center;
    background:
      radial-gradient(
        circle at 50% 0%,
        rgba(47,127,255,.13),
        transparent 55%
      ),
      rgba(255,255,255,.025);
  }

  .next-glow {
    position: absolute;
    width: 420px;
    height: 420px;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    border: 1px solid rgba(41,224,255,.06);
    border-radius: 50%;
    box-shadow:
      0 0 0 70px rgba(41,224,255,.015),
      0 0 0 140px rgba(41,224,255,.008);
  }

  .next-label {
    position: relative;
    color: var(--cyan);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .2em;
  }

  .next-card h2 {
    position: relative;
    margin: 20px 0;
    font-size: clamp(38px,5vw,60px);
    line-height: 1;
    letter-spacing: -.055em;
  }

  .next-card p {
    position: relative;
    max-width: 600px;
    margin: 0 auto 32px;
    color: var(--body);
    line-height: 1.7;
  }

  .cta-button,
  .back-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 11px;
    padding: 15px 23px;
    border-radius: 999px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 800;
  }

  .cta-button {
    border: 1px solid rgba(143,198,255,.3);
    background: linear-gradient(
      135deg,
      rgba(47,127,255,.9),
      rgba(41,224,255,.8)
    );
    color: #041018;
    box-shadow: 0 12px 35px rgba(47,127,255,.2);
  }

  .back-button {
    margin-top: 25px;
    border: 1px solid var(--border);
    color: var(--azure-soft);
    background: rgba(255,255,255,.035);
  }

  .loading-screen,
  .state-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 40px;
  }

  .loading-orb {
    width: 70px;
    height: 70px;
    margin-bottom: 25px;
    border: 1px solid rgba(41,224,255,.2);
    border-top-color: var(--cyan);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 0 30px rgba(41,224,255,.1);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text,
  .state-code {
    color: var(--cyan);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .2em;
  }

  .state-screen h1 {
    margin: 18px 0 10px;
    font-size: clamp(34px,5vw,60px);
    letter-spacing: -.05em;
  }

  .state-screen p {
    max-width: 550px;
    margin: 0;
    color: var(--muted);
    line-height: 1.7;
  }

  @media (max-width: 850px) {
    .content-layout {
      grid-template-columns: 1fr;
      gap: 50px;
    }

    .content-sidebar {
      padding-bottom: 30px;
      border-bottom: 1px solid var(--border);
    }
  }

  @media (max-width: 600px) {
    .detail-container {
      width: min(100% - 28px, 1180px);
    }

    .detail-hero {
      min-height: 70vh;
      padding: 120px 0 75px;
    }

    .hero-label {
      margin-top: 50px;
    }

    .detail-hero h1 {
      font-size: clamp(45px,13vw,70px);
    }

    .hero-description {
      font-size: 15px;
    }

    .hero-meta {
      gap: 25px;
      margin-top: 40px;
    }

    .cover-section {
      padding-bottom: 65px;
    }

    .cover-frame {
      min-height: 230px;
      border-radius: 22px;
    }

    .content-section {
      padding: 55px 0 80px;
    }

    .story-section {
      padding-bottom: 65px;
    }

    .next-card {
      padding: 65px 24px;
      border-radius: 24px;
    }
  }
`;