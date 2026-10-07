"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function TeamPage() {
  const supabase = getSupabaseClient();

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(
          `
            id,
            name,
            role,
            bio,
            photo_url,
            linkedin_url,
            sort_order
          `
        )
        .eq("is_published", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setTeam(data || []);
    } catch (err) {
      console.error("Team loading error:", err);

      setError(
        err?.message ||
          "Unable to load team information."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="team-page">
      <section className="team-hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="container">
          <div className="eyebrow">
            THE PEOPLE BEHIND THE SYSTEM
          </div>

          <h1>
            Built by people who
            <span> think ahead.</span>
          </h1>

          <p className="hero-description">
            Meet the people behind CEVTEXA —
            combining technology, design,
            intelligence and business thinking
            to build digital systems that move
            businesses forward.
          </p>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          {loading && (
            <div className="state-card">
              <div className="loader" />
              <p>Loading our team...</p>
            </div>
          )}

          {!loading && error && (
            <div className="state-card error-state">
              <div className="state-icon">
                !
              </div>

              <h3>
                Unable to load the team
              </h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={loadTeam}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            team.length === 0 && (
              <div className="state-card">
                <div className="state-icon">
                  ◇
                </div>

                <h3>
                  Our team is taking shape
                </h3>

                <p>
                  Published team profiles will
                  appear here.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            team.length > 0 && (
              <>
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">
                      CEVTEXA TEAM
                    </div>

                    <h2>
                      People behind the
                      <span> technology.</span>
                    </h2>
                  </div>

                  <p>
                    A multidisciplinary team
                    focused on building useful,
                    intelligent and scalable
                    digital products.
                  </p>
                </div>

                <div className="team-grid">
                  {team.map((member) => (
                    <TeamCard
                      key={member.id}
                      member={member}
                    />
                  ))}
                </div>
              </>
            )}
        </div>
      </section>

      <section className="team-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <div className="eyebrow">
                BUILD WITH US
              </div>

              <h2>
                Have an idea worth
                <span> building?</span>
              </h2>

              <p>
                Tell us what you're trying to
                build. We'll help turn the idea
                into a clear digital system.
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
        .team-page {
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

        .team-hero {
          position: relative;
          min-height: 560px;
          display: flex;
          align-items: center;
          overflow: hidden;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
          background:
            radial-gradient(
              circle at 78% 28%,
              rgba(47, 127, 255, 0.14),
              transparent 30%
            ),
            radial-gradient(
              circle at 25% 70%,
              rgba(41, 224, 255, 0.07),
              transparent 28%
            ),
            #05080d;
        }

        .team-hero .container {
          position: relative;
          z-index: 2;
          padding: 100px 0;
        }

        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }

        .hero-glow-one {
          width: 280px;
          height: 280px;
          right: 8%;
          top: 18%;
          background: rgba(
            47,
            127,
            255,
            0.08
          );
        }

        .hero-glow-two {
          width: 220px;
          height: 220px;
          left: 8%;
          bottom: -80px;
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

        .team-hero h1 {
          max-width: 900px;
          margin: 0;
          font-size: clamp(
            54px,
            8vw,
            104px
          );
          line-height: 0.94;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .team-hero h1 span,
        .section-heading h2 span,
        .cta-content h2 span {
          color: #2f7fff;
        }

        .hero-description {
          max-width: 680px;
          margin: 30px 0 0;
          color: #8b93a6;
          font-size: 17px;
          line-height: 1.8;
        }

        .team-section {
          padding: 110px 0;
        }

        .section-heading {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(280px, 420px);
          gap: 50px;
          align-items: end;
          margin-bottom: 55px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: clamp(
            36px,
            5vw,
            62px
          );
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .section-heading > p {
          margin: 0;
          color: #8b93a6;
          font-size: 14px;
          line-height: 1.8;
        }

        .team-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .team-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.015)
            );
          transition:
            transform 250ms ease,
            border-color 250ms ease,
            background 250ms ease;
        }

        .team-card:hover {
          transform: translateY(-6px);
          border-color:
            rgba(47, 127, 255, 0.32);
          background:
            linear-gradient(
              145deg,
              rgba(47, 127, 255, 0.08),
              rgba(255, 255, 255, 0.018)
            );
        }

        .member-photo {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 35%,
              rgba(47, 127, 255, 0.18),
              transparent 35%
            ),
            #0a0f18;
        }

        .member-photo img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform 500ms ease;
        }

        .team-card:hover .member-photo img {
          transform: scale(1.035);
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8fc6ff;
          font-size: 42px;
          font-weight: 800;
          background:
            radial-gradient(
              circle,
              rgba(47, 127, 255, 0.13),
              transparent 55%
            );
        }

        .member-content {
          padding: 22px;
        }

        .member-name {
          margin: 0;
          font-size: 21px;
          letter-spacing: -0.025em;
        }

        .member-role {
          margin-top: 6px;
          color: #29e0ff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .member-bio {
          margin: 15px 0 0;
          color: #8b93a6;
          font-size: 13px;
          line-height: 1.7;
        }

        .member-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .member-number {
          color: #4f586b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .linkedin {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          color: #8fc6ff;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
          transition:
            background 200ms ease,
            border-color 200ms ease;
        }

        .linkedin:hover {
          border-color:
            rgba(47, 127, 255, 0.35);
          background:
            rgba(47, 127, 255, 0.10);
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

        .state-card p {
          max-width: 500px;
          margin: 8px 0 0;
          color: #8b93a6;
          line-height: 1.7;
        }

        .state-card h3 {
          margin: 15px 0 0;
          font-size: 21px;
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
          color: #ff9696;
          background:
            rgba(248, 113, 113, 0.08);
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

        .team-cta {
          padding: 0 0 110px;
        }

        .cta-card {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
          overflow: hidden;
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

        .cta-content h2 {
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

        .cta-content p {
          max-width: 600px;
          margin: 17px 0 0;
          color: #8b93a6;
          line-height: 1.7;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
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

        .cta-button span {
          font-size: 16px;
        }

        @media (max-width: 900px) {
          .team-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .section-heading {
            grid-template-columns: 1fr;
            gap: 20px;
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

          .team-hero {
            min-height: 500px;
          }

          .team-hero .container {
            padding: 80px 0;
          }

          .team-hero h1 {
            font-size: clamp(
              48px,
              15vw,
              76px
            );
          }

          .hero-description {
            font-size: 14px;
          }

          .team-section {
            padding: 75px 0;
          }

          .team-grid {
            grid-template-columns: 1fr;
          }

          .cta-card {
            padding: 30px;
          }

          .team-cta {
            padding-bottom: 75px;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}

function TeamCard({ member }) {
  const initials = getInitials(member.name);

  return (
    <article className="team-card">
      <div className="member-photo">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={`${member.name} — ${
              member.role || "CEVTEXA team member"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="photo-placeholder">
            {initials}
          </div>
        )}
      </div>

      <div className="member-content">
        <h3 className="member-name">
          {member.name}
        </h3>

        {member.role && (
          <div className="member-role">
            {member.role}
          </div>
        )}

        {member.bio && (
          <p className="member-bio">
            {member.bio}
          </p>
        )}

        <div className="member-footer">
          <span className="member-number">
            CEVTEXA / TEAM
          </span>

          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin"
              aria-label={`Open ${member.name}'s LinkedIn`}
            >
              in
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function getInitials(name) {
  if (!name) {
    return "C";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}