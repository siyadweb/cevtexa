"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function WorkPage() {
  const supabase = getSupabaseClient();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndustry, setActiveIndustry] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          slug,
          short_description,
          description,
          client_name,
          industry,
          services,
          cover_image,
          project_url,
          featured,
          is_published,
          created_at
        `)
        .eq("is_published", true)
        .order("featured", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (err) {
      console.error("Projects loading error:", err);

      setError(
        err?.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  const industries = useMemo(() => {
    const values = projects
      .map((project) => project.industry)
      .filter(Boolean);

    return [...new Set(values)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeIndustry === "all") {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.industry === activeIndustry
    );
  }, [projects, activeIndustry]);

  return (
    <main className="work-page">
      <section className="work-hero">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="container">
          <div className="eyebrow">
            CEVTEXA / SELECTED WORK
          </div>

          <h1>
            Systems built
            <br />
            <span>to matter.</span>
          </h1>

          <p>
            A selection of digital products,
            intelligent systems and growth
            platforms built by CEVTEXA.
          </p>
        </div>
      </section>

      <section className="work-content">
        <div className="container">
          {!loading &&
            !error &&
            projects.length > 0 && (
              <div className="filter-bar">
                <button
                  type="button"
                  className={
                    activeIndustry === "all"
                      ? "filter active"
                      : "filter"
                  }
                  onClick={() =>
                    setActiveIndustry("all")
                  }
                >
                  All Work
                </button>

                {industries.map((industry) => (
                  <button
                    type="button"
                    key={industry}
                    className={
                      activeIndustry === industry
                        ? "filter active"
                        : "filter"
                    }
                    onClick={() =>
                      setActiveIndustry(
                        industry
                      )
                    }
                  >
                    {industry}
                  </button>
                ))}
              </div>
            )}

          {loading && (
            <div className="state-card">
              <div className="loader" />

              <h3>
                Loading selected work...
              </h3>

              <p>
                Fetching published CEVTEXA
                projects.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="state-card error-state">
              <div className="state-icon">
                !
              </div>

              <h3>
                Unable to load projects
              </h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={loadProjects}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            projects.length === 0 && (
              <div className="state-card">
                <div className="state-icon">
                  ◇
                </div>

                <h3>
                  No published projects yet
                </h3>

                <p>
                  Publish a project from the
                  CEVTEXA Admin Projects panel
                  to make it appear here.
                </p>

                <a
                  href="/admin/projects"
                  className="admin-link"
                >
                  Open Project Management ↗
                </a>
              </div>
            )}

          {!loading &&
            !error &&
            projects.length > 0 &&
            filteredProjects.length === 0 && (
              <div className="state-card">
                <div className="state-icon">
                  ◇
                </div>

                <h3>
                  No projects in this industry
                </h3>

                <p>
                  Select another category to
                  explore the portfolio.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredProjects.length > 0 && (
              <>
                <div className="content-heading">
                  <div>
                    <div className="eyebrow">
                      OUR PORTFOLIO
                    </div>

                    <h2>
                      Work that turns
                      <span> ideas real.</span>
                    </h2>
                  </div>

                  <div className="project-count">
                    {String(
                      filteredProjects.length
                    ).padStart(2, "0")}{" "}
                    PROJECTS
                  </div>
                </div>

                <div className="projects-grid">
                  {filteredProjects.map(
                    (project, index) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                        onOpen={() =>
                          setSelectedProject(
                            project
                          )
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
        </div>
      </section>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() =>
            setSelectedProject(null)
          }
        />
      )}

      <section className="work-cta">
        <div className="container">
          <div className="cta-card">
            <div>
              <div className="eyebrow">
                YOUR NEXT PROJECT
              </div>

              <h2>
                Ready to build
                <span> what's next?</span>
              </h2>

              <p>
                From first idea to production,
                we'll help turn your vision into a
                digital system built for growth.
              </p>
            </div>

            <a
              href="/contact"
              className="cta-button"
            >
              Start a Conversation
              <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        .work-page {
          min-height: 100vh;
          background: #05080d;
          color: #eceff5;
          overflow: hidden;
        }

        .container {
          width: min(
            1180px,
            calc(100% - 48px)
          );
          margin: 0 auto;
        }

        .work-hero {
          position: relative;
          min-height: 560px;
          display: flex;
          align-items: center;
          overflow: hidden;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
          background:
            radial-gradient(
              circle at 78% 30%,
              rgba(47, 127, 255, 0.15),
              transparent 32%
            ),
            radial-gradient(
              circle at 18% 75%,
              rgba(41, 224, 255, 0.06),
              transparent 28%
            ),
            #05080d;
        }

        .work-hero .container {
          position: relative;
          z-index: 2;
          padding: 100px 0;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          opacity: 0.2;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent
          );
        }

        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .hero-glow-one {
          width: 320px;
          height: 320px;
          right: 8%;
          top: 8%;
          background: rgba(
            47,
            127,
            255,
            0.1
          );
        }

        .hero-glow-two {
          width: 220px;
          height: 220px;
          left: 5%;
          bottom: -100px;
          background: rgba(
            41,
            224,
            255,
            0.06
          );
        }

        .eyebrow {
          margin-bottom: 16px;
          color: #29e0ff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .work-hero h1 {
          margin: 0;
          font-size: clamp(
            62px,
            9vw,
            112px
          );
          line-height: 0.9;
          letter-spacing: -0.065em;
        }

        .work-hero h1 span,
        .content-heading h2 span,
        .cta-card h2 span {
          color: #2f7fff;
        }

        .work-hero p {
          max-width: 650px;
          margin: 30px 0 0;
          color: #8b93a6;
          font-size: 17px;
          line-height: 1.8;
        }

        .work-content {
          padding: 95px 0 80px;
        }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 65px;
        }

        .filter {
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          background:
            rgba(255, 255, 255, 0.025);
          color: #8b93a6;
          padding: 10px 15px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition:
            color 180ms ease,
            background 180ms ease,
            border-color 180ms ease;
        }

        .filter:hover,
        .filter.active {
          border-color:
            rgba(47, 127, 255, 0.35);
          background:
            rgba(47, 127, 255, 0.1);
          color: #8fc6ff;
        }

        .content-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
          margin-bottom: 45px;
        }

        .content-heading h2 {
          margin: 0;
          font-size: clamp(
            38px,
            5vw,
            64px
          );
          line-height: 0.95;
          letter-spacing: -0.055em;
        }

        .project-count {
          color: #596276;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .projects-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .project-card {
          position: relative;
          overflow: hidden;
          min-width: 0;
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          background:
            rgba(255, 255, 255, 0.022);
          cursor: pointer;
          transition:
            transform 250ms ease,
            border-color 250ms ease,
            background 250ms ease;
        }

        .project-card:hover {
          transform: translateY(-6px);
          border-color:
            rgba(47, 127, 255, 0.32);
          background:
            rgba(47, 127, 255, 0.045);
        }

        .project-image {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(47, 127, 255, 0.2),
              transparent 42%
            ),
            #09101a;
        }

        .project-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform 500ms ease;
        }

        .project-card:hover
          .project-image img {
          transform: scale(1.04);
        }

        .image-placeholder {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #8fc6ff;
          font-size: 48px;
          font-weight: 800;
          background:
            radial-gradient(
              circle at center,
              rgba(47, 127, 255, 0.12),
              transparent 50%
            );
        }

        .featured-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 2;
          padding: 7px 10px;
          border: 1px solid
            rgba(41, 224, 255, 0.2);
          border-radius: 7px;
          background:
            rgba(3, 7, 12, 0.75);
          backdrop-filter: blur(10px);
          color: #29e0ff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .project-number {
          position: absolute;
          top: 15px;
          left: 15px;
          z-index: 2;
          padding: 7px 9px;
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          border-radius: 7px;
          background:
            rgba(3, 7, 12, 0.7);
          backdrop-filter: blur(10px);
          color: #c7cedc;
          font-size: 9px;
          font-weight: 800;
        }

        .project-body {
          padding: 24px;
        }

        .project-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          color: #29e0ff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .project-meta .muted {
          color: #596276;
        }

        .project-title {
          margin: 13px 0 0;
          font-size: 27px;
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .project-description {
          margin: 13px 0 0;
          color: #8b93a6;
          font-size: 13px;
          line-height: 1.7;
        }

        .service-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 18px;
        }

        .service-tag {
          padding: 6px 8px;
          border: 1px solid
            rgba(255, 255, 255, 0.07);
          border-radius: 6px;
          color: #8b93a6;
          font-size: 9px;
          font-weight: 700;
        }

        .project-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 21px;
          padding-top: 16px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.06);
        }

        .client {
          color: #596276;
          font-size: 10px;
        }

        .view-project {
          color: #c7cedc;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .state-card {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1px solid
            rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          background:
            rgba(255, 255, 255, 0.02);
          padding: 40px;
        }

        .state-card h3 {
          margin: 15px 0 0;
          font-size: 21px;
        }

        .state-card p {
          max-width: 500px;
          margin: 8px 0 0;
          color: #8b93a6;
          line-height: 1.7;
        }

        .state-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background:
            rgba(47, 127, 255, 0.09);
          color: #29e0ff;
          font-weight: 800;
        }

        .error-state .state-icon {
          background:
            rgba(248, 113, 113, 0.08);
          color: #ff9696;
        }

        .state-card button {
          margin-top: 22px;
          border: 1px solid
            rgba(47, 127, 255, 0.3);
          background:
            rgba(47, 127, 255, 0.09);
          color: #8fc6ff;
          padding: 11px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        .admin-link {
          display: inline-block;
          margin-top: 22px;
          color: #8fc6ff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .loader {
          width: 32px;
          height: 32px;
          border: 3px solid
            rgba(255, 255, 255, 0.08);
          border-top-color: #29e0ff;
          border-radius: 50%;
          animation: spin 800ms linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .work-cta {
          padding: 20px 0 110px;
        }

        .cta-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
          padding: 55px;
          border: 1px solid
            rgba(47, 127, 255, 0.17);
          border-radius: 22px;
          background:
            radial-gradient(
              circle at 85% 50%,
              rgba(47, 127, 255, 0.13),
              transparent 35%
            ),
            rgba(255, 255, 255, 0.025);
        }

        .cta-card h2 {
          max-width: 700px;
          margin: 0;
          font-size: clamp(
            35px,
            5vw,
            58px
          );
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .cta-card p {
          max-width: 600px;
          margin: 17px 0 0;
          color: #8b93a6;
          line-height: 1.7;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-shrink: 0;
          padding: 14px 19px;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #2f7fff,
              #29e0ff
            );
          color: #06101d;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          transition:
            transform 200ms ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        .project-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background:
            rgba(2, 5, 9, 0.82);
          backdrop-filter: blur(14px);
        }

        .modal-panel {
          position: relative;
          width: min(900px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid
            rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: #080d14;
          box-shadow:
            0 30px 100px
            rgba(0, 0, 0, 0.5);
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 3;
          width: 38px;
          height: 38px;
          border: 1px solid
            rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          background:
            rgba(4, 8, 13, 0.8);
          color: #eceff5;
          cursor: pointer;
          font-size: 17px;
        }

        .modal-cover {
          width: 100%;
          max-height: 390px;
          object-fit: cover;
          display: block;
        }

        .modal-placeholder {
          height: 260px;
          display: grid;
          place-items: center;
          color: #8fc6ff;
          font-size: 55px;
          font-weight: 800;
          background:
            radial-gradient(
              circle,
              rgba(47, 127, 255, 0.16),
              transparent 55%
            ),
            #09101a;
        }

        .modal-content {
          padding: 40px;
        }

        .modal-content h2 {
          margin: 0;
          font-size: clamp(
            34px,
            5vw,
            60px
          );
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .modal-client {
          margin-top: 14px;
          color: #596276;
          font-size: 11px;
        }

        .modal-description {
          margin: 25px 0 0;
          color: #c7cedc;
          font-size: 16px;
          line-height: 1.8;
        }

        .modal-services {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 25px;
        }

        .modal-service {
          padding: 7px 10px;
          border-radius: 7px;
          background:
            rgba(47, 127, 255, 0.08);
          border: 1px solid
            rgba(47, 127, 255, 0.13);
          color: #8fc6ff;
          font-size: 10px;
          font-weight: 700;
        }

        .modal-long-description {
          margin-top: 28px;
          padding-top: 28px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.07);
          color: #aeb7c8;
          font-size: 15px;
          line-height: 1.9;
          white-space: pre-wrap;
        }

        .modal-link {
          display: inline-flex;
          margin-top: 25px;
          padding: 12px 16px;
          border-radius: 9px;
          background:
            linear-gradient(
              135deg,
              #2f7fff,
              #29e0ff
            );
          color: #06101d;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
        }

        @media (max-width: 900px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }

          .cta-card {
            align-items: flex-start;
            flex-direction: column;
            padding: 38px;
          }
        }

        @media (max-width: 620px) {
          .container {
            width: min(
              100% - 30px,
              1180px
            );
          }

          .work-hero {
            min-height: 500px;
          }

          .work-hero .container {
            padding: 80px 0;
          }

          .work-hero h1 {
            font-size: clamp(
              55px,
              15vw,
              78px
            );
          }

          .work-hero p {
            font-size: 14px;
          }

          .work-content {
            padding: 70px 0;
          }

          .content-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .cta-card {
            padding: 30px;
          }

          .cta-button {
            width: 100%;
          }

          .project-modal {
            padding: 12px;
          }

          .modal-content {
            padding: 27px;
          }
        }
      `}</style>
    </main>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}) {
  const services = Array.isArray(
    project.services
  )
    ? project.services
    : [];

  return (
    <article
      className="project-card"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="project-image">
        <div className="project-number">
          {String(index + 1).padStart(2, "0")}
        </div>

        {project.featured && (
          <div className="featured-badge">
            FEATURED
          </div>
        )}

        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            CE
          </div>
        )}
      </div>

      <div className="project-body">
        <div className="project-meta">
          {project.industry && (
            <span>
              {project.industry}
            </span>
          )}

          {project.client_name && (
            <>
              <span className="muted">
                •
              </span>

              <span className="muted">
                {project.client_name}
              </span>
            </>
          )}
        </div>

        <h3 className="project-title">
          {project.title}
        </h3>

        {project.short_description && (
          <p className="project-description">
            {project.short_description}
          </p>
        )}

        {services.length > 0 && (
          <div className="service-tags">
            {services
              .slice(0, 5)
              .map((service, serviceIndex) => (
                <span
                  className="service-tag"
                  key={`${service}-${serviceIndex}`}
                >
                  {service}
                </span>
              ))}
          </div>
        )}

        <div className="project-footer">
          <span className="client">
            CEVTEXA PROJECT
          </span>

          <span className="view-project">
            View Project ↗
          </span>
        </div>
      </div>
    </article>
  );
}

function ProjectModal({
  project,
  onClose,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  const services = Array.isArray(
    project.services
  )
    ? project.services
    : [];

  return (
    <div
      className="project-modal"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <article className="modal-panel">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close project"
        >
          ×
        </button>

        {project.cover_image ? (
          <img
            className="modal-cover"
            src={project.cover_image}
            alt={project.title}
          />
        ) : (
          <div className="modal-placeholder">
            CE
          </div>
        )}

        <div className="modal-content">
          <div className="eyebrow">
            {project.industry ||
              "SELECTED PROJECT"}
          </div>

          <h2>{project.title}</h2>

          {project.client_name && (
            <div className="modal-client">
              CLIENT / {project.client_name}
            </div>
          )}

          {project.short_description && (
            <p className="modal-description">
              {project.short_description}
            </p>
          )}

          {services.length > 0 && (
            <div className="modal-services">
              {services.map(
                (service, index) => (
                  <span
                    className="modal-service"
                    key={`${service}-${index}`}
                  >
                    {service}
                  </span>
                )
              )}
            </div>
          )}

          {project.description && (
            <div className="modal-long-description">
              {project.description}
            </div>
          )}

          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link"
            >
              Visit Project ↗
            </a>
          )}
        </div>
      </article>
    </div>
  );
}