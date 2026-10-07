"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const STATUS_OPTIONS = [
  { value: "all", label: "All articles" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: "",
  status: "draft",
  published_at: "",
  seo_title: "",
  seo_description: "",
};

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

export default function BlogAdminPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function initialise() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          window.location.href = "/admin/login";
          return;
        }

        if (!active) return;

        setUser(currentUser);

        await Promise.all([
          loadPosts(),
          loadCategories(),
        ]);
      } catch (err) {
        console.error(err);

        if (active) {
          setError(
            err?.message ||
              "Unable to load the Blog control center."
          );
          setLoading(false);
        }
      }
    }

    initialise();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function loadPosts() {
    setLoading(true);
    setError("");

    const { data, error: postsError } = await supabase
      .from("blog_posts")
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image,
        category_id,
        author_id,
        status,
        published_at,
        seo_title,
        seo_description,
        created_at,
        updated_at
      `)
      .order("created_at", {
        ascending: false,
      });

    if (postsError) {
      console.error(postsError);
      setError(postsError.message);
      setLoading(false);
      return;
    }

    setPosts(data || []);
    setLoading(false);
  }

  async function loadCategories() {
    const { data, error: categoriesError } = await supabase
      .from("blog_categories")
      .select("id, name, slug, description")
      .order("name", {
        ascending: true,
      });

    if (categoriesError) {
      console.error(categoriesError);
      return;
    }

    setCategories(data || []);
  }

  function openNewArticle() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setEditorOpen(true);
  }

  function openEditArticle(post) {
    setEditingId(post.id);

    setForm({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover_image: post.cover_image || "",
      category_id: post.category_id || "",
      status: post.status || "draft",
      published_at: post.published_at
        ? new Date(post.published_at)
            .toISOString()
            .slice(0, 16)
        : "",
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
    });

    setError("");
    setSuccess("");
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;

    setEditorOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(value) {
    setForm((current) => ({
      ...current,
      title: value,
      slug:
        editingId || current.slug
          ? current.slug
          : makeSlug(value),
    }));
  }

  async function saveArticle(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const title = form.title.trim();

      if (!title) {
        throw new Error("Article title is required.");
      }

      const slug = (
        form.slug.trim() ||
        makeSlug(title)
      );

      if (!slug) {
        throw new Error("Article slug is required.");
      }

      const payload = {
        title,
        slug,
        excerpt:
          form.excerpt.trim() || null,
        content:
          form.content.trim() || null,
        cover_image:
          form.cover_image.trim() || null,
        category_id:
          form.category_id || null,
        status: form.status,
        published_at:
          form.status === "published"
            ? form.published_at
              ? new Date(form.published_at).toISOString()
              : new Date().toISOString()
            : null,
        seo_title:
          form.seo_title.trim() || null,
        seo_description:
          form.seo_description.trim() || null,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingId);
      } else {
        result = await supabase
          .from("blog_posts")
          .insert({
            ...payload,
            author_id: user?.id || null,
          });
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(
        editingId
          ? "Article updated successfully."
          : "Article created successfully."
      );

      await loadPosts();

      setTimeout(() => {
        setEditorOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setSuccess("");
      }, 500);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save the article."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle(post) {
    const confirmed = window.confirm(
      `Delete "${post.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", post.id);

    if (deleteError) {
      console.error(deleteError);
      setError(deleteError.message);
      return;
    }

    setSuccess("Article deleted.");
    await loadPosts();

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  }

  async function changeStatus(post, status) {
    setError("");
    setSuccess("");

    const payload = {
      status,
      published_at:
        status === "published"
          ? post.published_at ||
            new Date().toISOString()
          : null,
    };

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("id", post.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message);
      return;
    }

    setSuccess(
      `Article moved to ${statusLabel(status)}.`
    );

    await loadPosts();

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  }

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesStatus =
        statusFilter === "all" ||
        post.status === statusFilter;

      if (!matchesStatus) return false;

      if (!query) return true;

      return [
        post.title,
        post.slug,
        post.excerpt,
        post.content,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        );
    });
  }, [posts, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: posts.length,

      published: posts.filter(
        (post) => post.status === "published"
      ).length,

      drafts: posts.filter(
        (post) => post.status === "draft"
      ).length,

      archived: posts.filter(
        (post) => post.status === "archived"
      ).length,
    };
  }, [posts]);

  function categoryName(categoryId) {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "Uncategorised";
  }

  return (
    <main className="admin-blog-page">
      <style jsx>{`
        .admin-blog-page {
          min-height: 100vh;
          padding: 64px 52px 100px;
          background:
            radial-gradient(
              circle at 78% 0%,
              rgba(47, 127, 255, 0.09),
              transparent 32%
            ),
            #02070d;
          color: #edf3fb;
        }

        .admin-blog-shell {
          max-width: 1540px;
          margin: 0 auto;
        }

        .blog-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 58px;
        }

        .blog-kicker {
          margin-bottom: 18px;
          color: #29e0ff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .blog-title {
          margin: 0;
          max-width: 800px;
          color: #f1f5fb;
          font-size: clamp(64px, 7vw, 108px);
          font-weight: 700;
          letter-spacing: -0.075em;
          line-height: 0.88;
        }

        .blog-description {
          max-width: 650px;
          margin: 28px 0 0;
          color: #83a5c8;
          font-size: 20px;
          line-height: 1.55;
        }

        .blog-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .blog-button {
          min-height: 54px;
          padding: 0 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          background: rgba(6, 19, 32, 0.8);
          color: #dce9f8;
          font: inherit;
          cursor: pointer;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .blog-button:hover {
          transform: translateY(-2px);
          border-color: rgba(41, 224, 255, 0.4);
          background: rgba(10, 29, 47, 0.95);
        }

        .blog-button.primary {
          border: 0;
          background: linear-gradient(
            135deg,
            #2f7fff,
            #29e0ff
          );
          color: #00101a;
          font-weight: 700;
        }

        .blog-button.primary:hover {
          background: linear-gradient(
            135deg,
            #438dff,
            #49e6ff
          );
        }

        .blog-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .blog-stat-card {
          min-height: 174px;
          padding: 28px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              rgba(8, 23, 39, 0.96),
              rgba(4, 13, 23, 0.96)
            );
          box-sizing: border-box;
        }

        .blog-stat-card span {
          display: block;
          color: #6f94ba;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .blog-stat-card strong {
          display: block;
          margin-top: 26px;
          color: #edf4ff;
          font-size: 52px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .blog-stat-card strong.accent {
          color: #29e0ff;
        }

        .blog-stat-card p {
          margin: 12px 0 0;
          color: #587b9f;
          font-size: 14px;
        }

        .blog-library {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          background: rgba(3, 12, 21, 0.72);
        }

        .blog-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px auto;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .blog-input,
        .blog-select {
          width: 100%;
          min-height: 54px;
          padding: 0 18px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
          outline: none;
          box-sizing: border-box;
          background: #071726;
          color: #e7f0fa;
          font: inherit;
        }

        .blog-input::placeholder {
          color: #5c7895;
        }

        .blog-input:focus,
        .blog-select:focus {
          border-color: rgba(41, 224, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(41, 224, 255, 0.06);
        }

        .blog-refresh {
          min-width: 110px;
          border: 1px solid rgba(41, 224, 255, 0.2);
          border-radius: 14px;
          background: rgba(41, 224, 255, 0.04);
          color: #29e0ff;
          cursor: pointer;
          font: inherit;
        }

        .blog-refresh:hover {
          background: rgba(41, 224, 255, 0.09);
        }

        .blog-library-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .blog-library-title {
          display: flex;
          align-items: baseline;
          gap: 14px;
        }

        .blog-library-title span {
          color: #6286aa;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .blog-library-title strong {
          color: #e7f0fa;
          font-size: 16px;
        }

        .blog-mini-stats {
          display: flex;
          gap: 8px;
        }

        .blog-mini-stat {
          padding: 9px 12px;
          border-radius: 10px;
          background: rgba(10, 25, 42, 0.8);
          color: #6d91b6;
          font-size: 12px;
        }

        .blog-table {
          width: 100%;
        }

        .blog-table-head,
        .blog-table-row {
          display: grid;
          grid-template-columns:
            minmax(280px, 2.1fr)
            minmax(150px, 1fr)
            140px
            100px
            150px;
          gap: 18px;
          align-items: center;
          padding: 0 24px;
        }

        .blog-table-head {
          min-height: 52px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          color: #5f83a8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .blog-table-row {
          min-height: 94px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
        }

        .blog-table-row:last-child {
          border-bottom: 0;
        }

        .blog-article {
          min-width: 0;
        }

        .blog-article-title {
          overflow: hidden;
          color: #edf4fb;
          font-size: 15px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .blog-article-meta {
          margin-top: 7px;
          overflow: hidden;
          color: #557898;
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .blog-category {
          color: #7ca3ca;
          font-size: 13px;
        }

        .blog-status {
          display: inline-flex;
          width: fit-content;
          padding: 7px 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .blog-status.draft {
          color: #a6b9ce;
          background: rgba(150, 170, 195, 0.06);
        }

        .blog-status.published {
          border-color: rgba(41, 224, 255, 0.2);
          color: #29e0ff;
          background: rgba(41, 224, 255, 0.06);
        }

        .blog-status.archived {
          color: #b79595;
          background: rgba(180, 110, 110, 0.06);
        }

        .blog-date {
          color: #6284a5;
          font-size: 12px;
        }

        .blog-row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 7px;
        }

        .blog-row-button {
          min-height: 34px;
          padding: 0 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          background: #071522;
          color: #86a8c9;
          cursor: pointer;
          font-size: 11px;
        }

        .blog-row-button:hover {
          border-color: rgba(41, 224, 255, 0.25);
          color: #29e0ff;
        }

        .blog-row-button.delete:hover {
          border-color: rgba(255, 100, 100, 0.3);
          color: #ff9696;
        }

        .blog-empty {
          min-height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 30px;
          text-align: center;
        }

        .blog-empty-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 20px;
          border: 2px solid #29e0ff;
          transform: rotate(45deg);
        }

        .blog-empty h3 {
          margin: 0;
          color: #e7f0fa;
          font-size: 22px;
        }

        .blog-empty p {
          max-width: 500px;
          margin: 12px auto 24px;
          color: #6286aa;
          line-height: 1.6;
        }

        .blog-message {
          margin-bottom: 18px;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 13px;
        }

        .blog-message.error {
          border: 1px solid rgba(255, 100, 100, 0.2);
          background: rgba(255, 80, 80, 0.06);
          color: #ff9b9b;
        }

        .blog-message.success {
          border: 1px solid rgba(41, 224, 255, 0.2);
          background: rgba(41, 224, 255, 0.05);
          color: #29e0ff;
        }

        .blog-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: rgba(0, 4, 9, 0.78);
          backdrop-filter: blur(14px);
        }

        .blog-modal {
          width: min(100%, 900px);
          max-height: calc(100vh - 60px);
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(47, 127, 255, 0.08),
              transparent 35%
            ),
            #06111d;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.55);
        }

        .blog-modal-header {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(6, 17, 29, 0.94);
          backdrop-filter: blur(12px);
        }

        .blog-modal-kicker {
          color: #29e0ff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .blog-modal-title {
          margin: 5px 0 0;
          color: #edf4fb;
          font-size: 24px;
        }

        .blog-close {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px;
          background: #091a2b;
          color: #b8cce0;
          cursor: pointer;
          font-size: 20px;
        }

        .blog-form {
          padding: 28px;
        }

        .blog-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .blog-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .blog-field.full {
          grid-column: 1 / -1;
        }

        .blog-field label {
          color: #7f9fbe;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .blog-field input,
        .blog-field textarea,
        .blog-field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px;
          outline: none;
          background: #071725;
          color: #eaf3fb;
          font: inherit;
        }

        .blog-field input,
        .blog-field select {
          min-height: 50px;
          padding: 0 14px;
        }

        .blog-field textarea {
          min-height: 140px;
          padding: 14px;
          resize: vertical;
          line-height: 1.55;
        }

        .blog-field input:focus,
        .blog-field textarea:focus,
        .blog-field select:focus {
          border-color: rgba(41, 224, 255, 0.45);
          box-shadow: 0 0 0 3px rgba(41, 224, 255, 0.05);
        }

        .blog-slug-note {
          color: #557898;
          font-size: 11px;
        }

        .blog-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 26px;
          padding-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .blog-loading {
          padding: 80px 30px;
          color: #6386a9;
          text-align: center;
        }

        @media (max-width: 1100px) {
          .admin-blog-page {
            padding: 40px 24px 80px;
          }

          .blog-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .blog-toolbar {
            grid-template-columns: 1fr;
          }

          .blog-table {
            overflow-x: auto;
          }

          .blog-table-head,
          .blog-table-row {
            min-width: 1050px;
          }
        }

        @media (max-width: 760px) {
          .admin-blog-page {
            padding: 30px 16px 70px;
          }

          .blog-topbar {
            flex-direction: column;
            margin-bottom: 38px;
          }

          .blog-title {
            font-size: clamp(54px, 16vw, 82px);
          }

          .blog-description {
            font-size: 17px;
          }

          .blog-actions {
            width: 100%;
          }

          .blog-button {
            flex: 1;
          }

          .blog-stat-grid {
            grid-template-columns: 1fr;
          }

          .blog-stat-card {
            min-height: 145px;
          }

          .blog-library-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .blog-mini-stats {
            width: 100%;
          }

          .blog-mini-stat {
            flex: 1;
            text-align: center;
          }

          .blog-overlay {
            padding: 12px;
          }

          .blog-modal {
            max-height: calc(100vh - 24px);
          }

          .blog-form-grid {
            grid-template-columns: 1fr;
          }

          .blog-field.full {
            grid-column: auto;
          }

          .blog-form {
            padding: 20px;
          }

          .blog-modal-header {
            padding: 20px;
          }
        }
      `}</style>

      <div className="admin-blog-shell">
        {/* HEADER */}
        <header className="blog-topbar">
          <div>
            <div className="blog-kicker">
              Content / Insights
            </div>

            <h1 className="blog-title">
              Blog /<br />
              Insights
            </h1>

            <p className="blog-description">
              Create, manage and publish CEVTEXA insights,
              articles and knowledge.
            </p>
          </div>

          <div className="blog-actions">
            <button
              className="blog-button"
              type="button"
              onClick={() => {
                window.location.href = "/admin";
              }}
            >
              ← Dashboard
            </button>

            <button
              className="blog-button primary"
              type="button"
              onClick={openNewArticle}
            >
              + New article
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        {error && (
          <div className="blog-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="blog-message success">
            {success}
          </div>
        )}

        {/* STATISTICS */}
        <section className="blog-stat-grid">
          <div className="blog-stat-card">
            <span>Total</span>

            <strong>{stats.total}</strong>

            <p>All articles</p>
          </div>

          <div className="blog-stat-card">
            <span>Published</span>

            <strong className="accent">
              {stats.published}
            </strong>

            <p>Live on website</p>
          </div>

          <div className="blog-stat-card">
            <span>Drafts</span>

            <strong>{stats.drafts}</strong>

            <p>Work in progress</p>
          </div>

          <div className="blog-stat-card">
            <span>Archived</span>

            <strong>{stats.archived}</strong>

            <p>Hidden articles</p>
          </div>
        </section>

        {/* LIBRARY */}
        <section className="blog-library">
          <div className="blog-toolbar">
            <input
              className="blog-input"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search title, slug, excerpt..."
            />

            <select
              className="blog-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              className="blog-refresh"
              type="button"
              onClick={() => {
                loadPosts();
                loadCategories();
              }}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="blog-library-head">
            <div className="blog-library-title">
              <span>Article</span>

              <strong>
                {filteredPosts.length}{" "}
                {filteredPosts.length === 1
                  ? "article"
                  : "articles"}
              </strong>
            </div>

            <div className="blog-mini-stats">
              <div className="blog-mini-stat">
                Published {stats.published}
              </div>

              <div className="blog-mini-stat">
                Drafts {stats.drafts}
              </div>

              <div className="blog-mini-stat">
                Archived {stats.archived}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="blog-loading">
              Loading article library...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="blog-empty">
              <div className="blog-empty-icon" />

              <h3>
                {posts.length === 0
                  ? "No articles yet"
                  : "No matching articles"}
              </h3>

              <p>
                {posts.length === 0
                  ? "Create your first CEVTEXA insight to start building the knowledge library."
                  : "Try changing your search or status filter."}
              </p>

              {posts.length === 0 && (
                <button
                  className="blog-button primary"
                  type="button"
                  onClick={openNewArticle}
                >
                  + Create first article
                </button>
              )}
            </div>
          ) : (
            <div className="blog-table">
              <div className="blog-table-head">
                <div>Article</div>
                <div>Category</div>
                <div>Status</div>
                <div>Created</div>
                <div>Actions</div>
              </div>

              {filteredPosts.map((post) => (
                <div
                  className="blog-table-row"
                  key={post.id}
                >
                  <div className="blog-article">
                    <div className="blog-article-title">
                      {post.title}
                    </div>

                    <div className="blog-article-meta">
                      /{post.slug}
                    </div>
                  </div>

                  <div className="blog-category">
                    {categoryName(
                      post.category_id
                    )}
                  </div>

                  <div>
                    <select
                      className={`blog-status ${post.status}`}
                      value={post.status}
                      onChange={(event) =>
                        changeStatus(
                          post,
                          event.target.value
                        )
                      }
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>

                      <option value="archived">
                        Archived
                      </option>
                    </select>
                  </div>

                  <div className="blog-date">
                    {formatDate(
                      post.created_at
                    )}
                  </div>

                  <div className="blog-row-actions">
                    <button
                      className="blog-row-button"
                      type="button"
                      onClick={() =>
                        openEditArticle(post)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="blog-row-button delete"
                      type="button"
                      onClick={() =>
                        deleteArticle(post)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ARTICLE EDITOR */}
      {editorOpen && (
        <div
          className="blog-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeEditor();
            }
          }}
        >
          <div className="blog-modal">
            <div className="blog-modal-header">
              <div>
                <div className="blog-modal-kicker">
                  {editingId
                    ? "Edit article"
                    : "New article"}
                </div>

                <h2 className="blog-modal-title">
                  {editingId
                    ? "Update insight"
                    : "Create insight"}
                </h2>
              </div>

              <button
                className="blog-close"
                type="button"
                onClick={closeEditor}
              >
                ×
              </button>
            </div>

            <form
              className="blog-form"
              onSubmit={saveArticle}
            >
              <div className="blog-form-grid">
                <div className="blog-field full">
                  <label>
                    Article title
                  </label>

                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value
                      )
                    }
                    placeholder="e.g. How AI Is Changing Business Automation"
                  />
                </div>

                <div className="blog-field">
                  <label>Slug</label>

                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        makeSlug(
                          event.target.value
                        )
                      )
                    }
                    placeholder="ai-business-automation"
                  />

                  <span className="blog-slug-note">
                    Used in the article URL.
                  </span>
                </div>

                <div className="blog-field">
                  <label>Category</label>

                  <select
                    value={form.category_id}
                    onChange={(event) =>
                      updateField(
                        "category_id",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Uncategorized
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="blog-field">
                  <label>Status</label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>

                    <option value="archived">
                      Archived
                    </option>
                  </select>
                </div>

                <div className="blog-field">
                  <label>
                    Publish date
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.published_at
                    }
                    onChange={(event) =>
                      updateField(
                        "published_at",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="blog-field full">
                  <label>Excerpt</label>

                  <textarea
                    value={form.excerpt}
                    onChange={(event) =>
                      updateField(
                        "excerpt",
                        event.target.value
                      )
                    }
                    placeholder="Short summary shown on article cards and search results..."
                  />
                </div>

                <div className="blog-field full">
                  <label>
                    Article content
                  </label>

                  <textarea
                    style={{
                      minHeight: "300px",
                    }}
                    value={form.content}
                    onChange={(event) =>
                      updateField(
                        "content",
                        event.target.value
                      )
                    }
                    placeholder="Write the full article content here..."
                  />
                </div>

                <div className="blog-field full">
                  <label>
                    Cover image URL
                  </label>

                  <input
                    type="url"
                    value={
                      form.cover_image
                    }
                    onChange={(event) =>
                      updateField(
                        "cover_image",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="blog-field full">
                  <label>
                    SEO title
                  </label>

                  <input
                    type="text"
                    value={form.seo_title}
                    onChange={(event) =>
                      updateField(
                        "seo_title",
                        event.target.value
                      )
                    }
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div className="blog-field full">
                  <label>
                    SEO description
                  </label>

                  <textarea
                    value={
                      form.seo_description
                    }
                    onChange={(event) =>
                      updateField(
                        "seo_description",
                        event.target.value
                      )
                    }
                    placeholder="SEO meta description..."
                  />
                </div>
              </div>

              <div className="blog-modal-footer">
                <button
                  className="blog-button"
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="blog-button primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save changes"
                    : "Create article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}