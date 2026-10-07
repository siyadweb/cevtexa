"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function InsightsPage() {
  const supabase = getSupabaseClient();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    setLoading(true);
    setError("");

    try {
      const [postsResult, categoriesResult] =
        await Promise.all([
          supabase
            .from("blog_posts")
            .select(
              `
                id,
                title,
                slug,
                excerpt,
                content,
                cover_image,
                category_id,
                status,
                published_at,
                seo_title,
                seo_description
              `
            )
            .eq("status", "published")
            .order("published_at", {
              ascending: false,
              nullsFirst: false,
            })
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("blog_categories")
            .select(
              `
                id,
                name,
                slug,
                description
              `
            )
            .order("name", {
              ascending: true,
            }),
        ]);

      if (postsResult.error) {
        throw postsResult.error;
      }

      if (categoriesResult.error) {
        throw categoriesResult.error;
      }

      setPosts(postsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (err) {
      console.error("Insights loading error:", err);

      setError(
        err?.message ||
          "Unable to load insights."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.category_id === activeCategory
    );
  }, [posts, activeCategory]);

  function getCategoryName(categoryId) {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "CEVTEXA";
  }

  return (
    <main className="insights-page">
      <section className="insights-hero">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="container">
          <div className="eyebrow">
            CEVTEXA / INSIGHTS
          </div>

          <h1>
            Ideas worth
            <br />
            <span>building.</span>
          </h1>

          <p>
            Notes on AI, software, automation,
            digital growth and the systems
            connecting them.
          </p>
        </div>
      </section>

      <section className="insights-content">
        <div className="container">
          {!loading &&
            !error &&
            posts.length > 0 && (
              <div className="category-bar">
                <button
                  type="button"
                  className={
                    activeCategory === "all"
                      ? "category active"
                      : "category"
                  }
                  onClick={() =>
                    setActiveCategory("all")
                  }
                >
                  All
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className={
                      activeCategory === category.id
                        ? "category active"
                        : "category"
                    }
                    onClick={() =>
                      setActiveCategory(
                        category.id
                      )
                    }
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

          {loading && (
            <div className="state-card">
              <div className="loader" />

              <h3>
                Loading insights...
              </h3>

              <p>
                Fetching the latest CEVTEXA
                articles.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="state-card error-state">
              <div className="state-icon">
                !
              </div>

              <h3>
                Unable to load insights
              </h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={loadInsights}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            posts.length === 0 && (
              <div className="state-card">
                <div className="state-icon">
                  ◇
                </div>

                <h3>
                  No published insights yet
                </h3>

                <p>
                  Publish an article from the
                  CEVTEXA Admin Blog to make it
                  appear here.
                </p>

                <a
                  href="/admin/blog"
                  className="admin-link"
                >
                  Open Blog Management ↗
                </a>
              </div>
            )}

          {!loading &&
            !error &&
            posts.length > 0 &&
            filteredPosts.length === 0 && (
              <div className="state-card">
                <div className="state-icon">
                  ◇
                </div>

                <h3>
                  No articles in this category
                </h3>

                <p>
                  Choose another category to
                  continue exploring.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredPosts.length > 0 && (
              <>
                <div className="content-heading">
                  <div>
                    <div className="eyebrow">
                      LATEST THINKING
                    </div>

                    <h2>
                      From idea
                      <span> to impact.</span>
                    </h2>
                  </div>

                  <div className="article-count">
                    {filteredPosts.length
                      .toString()
                      .padStart(2, "0")}{" "}
                    ARTICLES
                  </div>
                </div>

                <div className="posts-grid">
                  {filteredPosts.map(
                    (post, index) => (
                      <ArticleCard
                        key={post.id}
                        post={post}
                        index={index}
                        categoryName={getCategoryName(
                          post.category_id
                        )}
                        onOpen={() =>
                          setSelectedPost(post)
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
        </div>
      </section>

      {selectedPost && (
        <ArticleModal
          post={selectedPost}
          categoryName={getCategoryName(
            selectedPost.category_id
          )}
          onClose={() =>
            setSelectedPost(null)
          }
        />
      )}

      <section className="insights-cta">
        <div className="container">
          <div className="cta-card">
            <div>
              <div className="eyebrow">
                HAVE AN IDEA?
              </div>

              <h2>
                Let's turn it into
                <span> something real.</span>
              </h2>

              <p>
                If something you read here
                sparked an idea, let's talk about
                what you could build next.
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
        .insights-page {
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

        .insights-hero {
          position: relative;
          min-height: 560px;
          display: flex;
          align-items: center;
          overflow: hidden;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
          background:
            radial-gradient(
              circle at 78% 35%,
              rgba(47, 127, 255, 0.14),
              transparent 32%
            ),
            radial-gradient(
              circle at 20% 75%,
              rgba(41, 224, 255, 0.06),
              transparent 30%
            ),
            #05080d;
        }

        .insights-hero .container {
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
          width: 300px;
          height: 300px;
          right: 10%;
          top: 12%;
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

        .insights-hero h1 {
          margin: 0;
          font-size: clamp(
            62px,
            9vw,
            112px
          );
          line-height: 0.9;
          letter-spacing: -0.065em;
        }

        .insights-hero h1 span,
        .content-heading h2 span,
        .cta-card h2 span {
          color: #2f7fff;
        }

        .insights-hero p {
          max-width: 650px;
          margin: 30px 0 0;
          color: #8b93a6;
          font-size: 17px;
          line-height: 1.8;
        }

        .insights-content {
          padding: 95px 0 80px;
        }

        .category-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 65px;
        }

        .category {
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

        .category:hover,
        .category.active {
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

        .article-count {
          color: #596276;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .posts-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .post-card {
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

        .post-card:hover {
          transform: translateY(-6px);
          border-color:
            rgba(47, 127, 255, 0.32);
          background:
            rgba(47, 127, 255, 0.045);
        }

        .post-image {
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

        .post-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform 500ms ease;
        }

        .post-card:hover .post-image img {
          transform: scale(1.04);
        }

        .image-placeholder {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #8fc6ff;
          font-size: 42px;
          font-weight: 800;
          background:
            radial-gradient(
              circle at center,
              rgba(47, 127, 255, 0.12),
              transparent 50%
            );
        }

        .post-index {
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

        .post-body {
          padding: 23px;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #29e0ff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .post-meta span:last-child {
          color: #596276;
        }

        .post-title {
          margin: 13px 0 0;
          font-size: 22px;
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .post-excerpt {
          margin: 13px 0 0;
          color: #8b93a6;
          font-size: 13px;
          line-height: 1.7;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.06);
        }

        .read-label {
          color: #c7cedc;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .read-arrow {
          color: #29e0ff;
          font-size: 17px;
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

        .insights-cta {
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

        .article-modal {
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

        .modal-date {
          margin-top: 15px;
          color: #596276;
          font-size: 11px;
        }

        .modal-excerpt {
          margin: 25px 0 0;
          color: #c7cedc;
          font-size: 16px;
          line-height: 1.8;
        }

        .modal-article {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.07);
          color: #aeb7c8;
          font-size: 15px;
          line-height: 1.9;
          white-space: pre-wrap;
        }

        @media (max-width: 900px) {
          .posts-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
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

          .insights-hero {
            min-height: 500px;
          }

          .insights-hero .container {
            padding: 80px 0;
          }

          .insights-hero h1 {
            font-size: clamp(
              55px,
              15vw,
              78px
            );
          }

          .insights-hero p {
            font-size: 14px;
          }

          .insights-content {
            padding: 70px 0;
          }

          .posts-grid {
            grid-template-columns: 1fr;
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

          .article-modal {
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

function ArticleCard({
  post,
  index,
  categoryName,
  onOpen,
}) {
  return (
    <article
      className="post-card"
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
      <div className="post-image">
        <div className="post-index">
          {String(index + 1).padStart(2, "0")}
        </div>

        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            CE
          </div>
        )}
      </div>

      <div className="post-body">
        <div className="post-meta">
          <span>{categoryName}</span>

          {post.published_at && (
            <>
              <span>•</span>
              <span>
                {formatDate(
                  post.published_at
                )}
              </span>
            </>
          )}
        </div>

        <h3 className="post-title">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="post-excerpt">
            {post.excerpt}
          </p>
        )}

        <div className="post-footer">
          <span className="read-label">
            Read article
          </span>

          <span className="read-arrow">
            ↗
          </span>
        </div>
      </div>
    </article>
  );
}

function ArticleModal({
  post,
  categoryName,
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

  return (
    <div
      className="article-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <article className="modal-panel">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close article"
        >
          ×
        </button>

        {post.cover_image ? (
          <img
            className="modal-cover"
            src={post.cover_image}
            alt={post.title}
          />
        ) : (
          <div className="modal-placeholder">
            CE
          </div>
        )}

        <div className="modal-content">
          <div className="eyebrow">
            {categoryName}
          </div>

          <h2>{post.title}</h2>

          {post.published_at && (
            <div className="modal-date">
              Published{" "}
              {formatDate(
                post.published_at
              )}
            </div>
          )}

          {post.excerpt && (
            <p className="modal-excerpt">
              {post.excerpt}
            </p>
          )}

          {post.content && (
            <div className="modal-article">
              {post.content}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}