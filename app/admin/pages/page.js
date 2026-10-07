"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

const EMPTY_PAGE = {
  title: "",
  slug: "",
  content: "",
  status: "draft",
  seo_title: "",
  seo_description: "",
};

const PAGE_STATUSES = ["draft", "published", "archived"];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function titleCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function PagesAdminPage() {
  const router = useRouter();

  const [supabase, setSupabase] = useState(null);

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState(EMPTY_PAGE);

  const loadPages = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: pagesError } = await supabase
        .from("pages")
        .select(
          "id,title,slug,content,status,seo_title,seo_description,created_at,updated_at"
        )
        .order("updated_at", { ascending: false });

      if (pagesError) {
        throw pagesError;
      }

      setPages(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load pages.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const client = getSupabaseClient();

        const {
          data: { session },
        } = await client.auth.getSession();

        if (!mounted) return;

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        setSupabase(client);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to initialize admin.");
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (supabase) {
      loadPages();
    }
  }, [supabase, loadPages]);

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pages.filter((page) => {
      const matchesSearch =
        !query ||
        [
          page.title,
          page.slug,
          page.content,
          page.seo_title,
          page.seo_description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" || page.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pages, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: pages.length,
      published: pages.filter((page) => page.status === "published").length,
      drafts: pages.filter((page) => page.status === "draft").length,
      archived: pages.filter((page) => page.status === "archived").length,
    };
  }, [pages]);

  function openCreatePage() {
    setEditingPage(null);
    setPageForm(EMPTY_PAGE);
    setError("");
    setNotice("");
    setShowEditor(true);
  }

  function openEditPage(page) {
    setEditingPage(page);

    setPageForm({
      title: page.title || "",
      slug: page.slug || "",
      content: page.content || "",
      status: page.status || "draft",
      seo_title: page.seo_title || "",
      seo_description: page.seo_description || "",
    });

    setError("");
    setNotice("");
    setShowEditor(true);
  }

  function closeEditor() {
    if (saving) return;

    setShowEditor(false);
    setEditingPage(null);
    setPageForm(EMPTY_PAGE);
  }

  function updateField(field, value) {
    setPageForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(value) {
    setPageForm((current) => ({
      ...current,
      title: value,
      slug: current.slug || slugify(value),
    }));
  }

  async function savePage(event) {
    event.preventDefault();

    if (!supabase) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (!pageForm.title.trim()) {
        throw new Error("Page title is required.");
      }

      const slug = slugify(pageForm.slug || pageForm.title);

      if (!slug) {
        throw new Error("A valid page slug is required.");
      }

      const payload = {
        title: pageForm.title.trim(),
        slug,
        content: pageForm.content.trim() || null,
        status: pageForm.status,
        seo_title: pageForm.seo_title.trim() || null,
        seo_description: pageForm.seo_description.trim() || null,
      };

      let result;

      if (editingPage) {
        result = await supabase
          .from("pages")
          .update(payload)
          .eq("id", editingPage.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("pages")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setNotice(
        editingPage
          ? "Page updated successfully."
          : "Page created successfully."
      );

      closeEditor();
      await loadPages();
    } catch (err) {
      console.error(err);

      if (String(err.message || "").toLowerCase().includes("duplicate")) {
        setError("That page slug already exists. Please use a different slug.");
      } else {
        setError(err.message || "Unable to save page.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(page, status) {
    if (!supabase) return;

    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase
        .from("pages")
        .update({ status })
        .eq("id", page.id);

      if (updateError) {
        throw updateError;
      }

      setNotice(`Page moved to ${titleCase(status)}.`);
      await loadPages();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update page status.");
    }
  }

  async function deletePage(page) {
    if (!supabase) return;

    const confirmed = window.confirm(
      `Delete "${page.title}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const { error: deleteError } = await supabase
        .from("pages")
        .delete()
        .eq("id", page.id);

      if (deleteError) {
        throw deleteError;
      }

      setNotice("Page deleted successfully.");
      await loadPages();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete page.");
    }
  }

  function clearMessages() {
    setError("");
    setNotice("");
  }

  return (
    <main className="pages-admin">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #02070d;
          color: #ecf3fb;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .pages-admin {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 85% 0%,
              rgba(47, 127, 255, 0.13),
              transparent 35%
            ),
            radial-gradient(
              circle at 20% 20%,
              rgba(41, 224, 255, 0.055),
              transparent 28%
            ),
            #02070d;
          padding: 58px 60px 100px;
        }

        .pages-shell {
          max-width: 1480px;
          margin: 0 auto;
        }

        .topline {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
          margin-bottom: 52px;
        }

        .eyebrow {
          color: #29e0ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.25em;
          margin-bottom: 15px;
        }

        .title {
          margin: 0;
          font-size: clamp(64px, 7vw, 112px);
          line-height: 0.9;
          letter-spacing: -0.065em;
          font-weight: 850;
        }

        .subtitle {
          max-width: 780px;
          color: #8fa9c4;
          font-size: 18px;
          line-height: 1.65;
          margin: 25px 0 0;
        }

        .top-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .button {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(5, 16, 29, 0.75);
          color: #edf6ff;
          min-height: 52px;
          padding: 0 21px;
          border-radius: 14px;
          font-weight: 750;
          transition: 0.2s ease;
        }

        .button:hover {
          transform: translateY(-1px);
          border-color: rgba(41, 224, 255, 0.5);
        }

        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .button.primary {
          border: none;
          color: #03101b;
          background: linear-gradient(135deg, #2f7fff, #29e0ff);
        }

        .button.danger {
          color: #ffb4b4;
          border-color: rgba(255, 90, 90, 0.2);
        }

        .button.small {
          min-height: 39px;
          padding: 0 12px;
          border-radius: 9px;
          font-size: 12px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          min-height: 155px;
          padding: 26px;
          border: 1px solid rgba(140, 180, 220, 0.14);
          border-radius: 22px;
          background: rgba(4, 15, 27, 0.75);
          box-shadow: inset 0 1px rgba(255, 255, 255, 0.025);
        }

        .stat-label {
          color: #5d8bb9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .stat-value {
          margin-top: 20px;
          font-size: 43px;
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .stat-help {
          margin-top: 6px;
          color: #557797;
          font-size: 13px;
        }

        .workspace {
          border: 1px solid rgba(140, 180, 220, 0.14);
          border-radius: 24px;
          background: rgba(2, 11, 20, 0.78);
          overflow: hidden;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr 210px auto;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.1);
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          border: 1px solid rgba(140, 180, 220, 0.15);
          background: #061522;
          color: #eaf5ff;
          border-radius: 12px;
          outline: none;
        }

        .input,
        .select {
          height: 50px;
          padding: 0 15px;
        }

        .textarea {
          min-height: 300px;
          padding: 15px;
          resize: vertical;
          line-height: 1.7;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          border-color: rgba(41, 224, 255, 0.55);
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 22px 25px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.1);
        }

        .section-title {
          font-size: 15px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .section-count {
          color: #557b9d;
          margin-left: 7px;
          font-weight: 500;
          text-transform: none;
          letter-spacing: normal;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          color: #53728e;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 800;
          padding: 17px 24px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.08);
        }

        .table td {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.07);
          vertical-align: middle;
        }

        .table tr:last-child td {
          border-bottom: 0;
        }

        .page-name {
          color: #eef7ff;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .slug {
          color: #557b99;
          font-size: 12px;
        }

        .muted {
          color: #5c7b96;
          font-size: 13px;
        }

        .content-preview {
          max-width: 330px;
          color: #6f8ca4;
          font-size: 12px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 750;
          white-space: nowrap;
        }

        .badge.published {
          color: #66e8b4;
          background: rgba(35, 205, 137, 0.09);
        }

        .badge.draft {
          color: #8cb6dd;
          background: rgba(47, 127, 255, 0.09);
        }

        .badge.archived {
          color: #8898a8;
          background: rgba(255, 255, 255, 0.045);
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 7px;
          flex-wrap: wrap;
        }

        .empty {
          padding: 75px 30px;
          text-align: center;
          color: #58758e;
        }

        .empty strong {
          display: block;
          color: #9cb6cd;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .alert {
          margin-bottom: 20px;
          border-radius: 14px;
          padding: 14px 17px;
          font-size: 14px;
        }

        .alert.error {
          color: #ffb8b8;
          border: 1px solid rgba(255, 80, 80, 0.2);
          background: rgba(255, 60, 60, 0.06);
        }

        .alert.success {
          color: #8ff2c1;
          border: 1px solid rgba(80, 230, 160, 0.18);
          background: rgba(80, 230, 160, 0.055);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          padding: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0, 3, 8, 0.8);
          backdrop-filter: blur(12px);
        }

        .modal {
          width: min(950px, 100%);
          max-height: calc(100vh - 50px);
          overflow: auto;
          border: 1px solid rgba(140, 180, 220, 0.17);
          border-radius: 24px;
          background: #04101b;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.55);
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 25px;
          border-bottom: 1px solid rgba(140, 180, 220, 0.1);
        }

        .modal-title {
          margin: 0;
          font-size: 25px;
        }

        .close {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: #9cb5ca;
          font-size: 20px;
        }

        .form {
          padding: 25px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          display: block;
          color: #7799b5;
          font-size: 12px;
          font-weight: 750;
          margin-bottom: 8px;
        }

        .field-help {
          margin-top: 7px;
          color: #53718b;
          font-size: 11px;
          line-height: 1.5;
        }

        .seo-counter {
          display: flex;
          justify-content: flex-end;
          color: #52728c;
          font-size: 10px;
          margin-top: 5px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px 25px 25px;
          border-top: 1px solid rgba(140, 180, 220, 0.1);
        }

        .editor-note {
          margin-bottom: 20px;
          padding: 13px 15px;
          border-radius: 12px;
          border: 1px solid rgba(41, 224, 255, 0.1);
          background: rgba(41, 224, 255, 0.035);
          color: #6e8da8;
          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width: 1150px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .toolbar {
            grid-template-columns: 1fr 190px;
          }
        }

        @media (max-width: 950px) {
          .pages-admin {
            padding: 40px 24px 70px;
          }

          .topline {
            flex-direction: column;
          }

          .top-actions {
            justify-content: flex-start;
          }

          .table {
            min-width: 950px;
          }

          .workspace {
            overflow-x: auto;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .pages-admin {
            padding: 30px 15px 60px;
          }

          .title {
            font-size: 58px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .top-actions {
            width: 100%;
          }

          .top-actions .button {
            flex: 1;
          }
        }
      `}</style>

      <div className="pages-shell">
        <header className="topline">
          <div>
            <div className="eyebrow">CONTENT / CMS</div>

            <h1 className="title">Pages</h1>

            <p className="subtitle">
              Manage editable website pages, publishing status and page-level
              SEO content from the CEVTEXA control center.
            </p>
          </div>

          <div className="top-actions">
            <button
              className="button"
              onClick={() => router.push("/admin")}
            >
              ← Dashboard
            </button>

            <button
              className="button primary"
              onClick={openCreatePage}
            >
              + New page
            </button>
          </div>
        </header>

        {(error || notice) && (
          <div
            className={`alert ${error ? "error" : "success"}`}
            onClick={clearMessages}
          >
            {error || notice}
          </div>
        )}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-label">Total Pages</div>

            <div className="stat-value">{stats.total}</div>

            <div className="stat-help">
              All CMS pages
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Published</div>

            <div className="stat-value">{stats.published}</div>

            <div className="stat-help">
              Visible publicly
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Drafts</div>

            <div className="stat-value">{stats.drafts}</div>

            <div className="stat-help">
              Still being prepared
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Archived</div>

            <div className="stat-value">{stats.archived}</div>

            <div className="stat-help">
              Hidden from the website
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="toolbar">
            <input
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search page title, slug, content..."
            />

            <select
              className="select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All statuses</option>

              {PAGE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {titleCase(status)}
                </option>
              ))}
            </select>

            <button
              className="button"
              onClick={loadPages}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="section-head">
            <div className="section-title">
              WEBSITE PAGES

              <span className="section-count">
                {filteredPages.length} pages
              </span>
            </div>

            <button
              className="button small primary"
              onClick={openCreatePage}
            >
              + Add page
            </button>
          </div>

          {loading ? (
            <div className="empty">
              <strong>Loading pages...</strong>
              Please wait.
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="empty">
              <strong>No pages found</strong>

              Create your first CMS page.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Content</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <div className="page-name">
                        {page.title}
                      </div>

                      <div className="slug">
                        /{page.slug}
                      </div>
                    </td>

                    <td>
                      <div className="content-preview">
                        {page.content || "No content yet."}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge ${page.status}`}
                      >
                        ● {titleCase(page.status)}
                      </span>
                    </td>

                    <td>
                      <span className="muted">
                        {formatDate(page.updated_at)}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="button small"
                          onClick={() => openEditPage(page)}
                        >
                          Edit
                        </button>

                        {page.status !== "published" && (
                          <button
                            className="button small"
                            onClick={() =>
                              changeStatus(page, "published")
                            }
                          >
                            Publish
                          </button>
                        )}

                        {page.status === "published" && (
                          <button
                            className="button small"
                            onClick={() =>
                              changeStatus(page, "draft")
                            }
                          >
                            Unpublish
                          </button>
                        )}

                        {page.status !== "archived" && (
                          <button
                            className="button small"
                            onClick={() =>
                              changeStatus(page, "archived")
                            }
                          >
                            Archive
                          </button>
                        )}

                        <button
                          className="button small danger"
                          onClick={() => deletePage(page)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {showEditor && (
        <div
          className="modal-backdrop"
          onMouseDown={closeEditor}
        >
          <div
            className="modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-head">
              <div>
                <div className="eyebrow">
                  CONTENT / PAGE EDITOR
                </div>

                <h2 className="modal-title">
                  {editingPage
                    ? "Edit page"
                    : "Create page"}
                </h2>
              </div>

              <button
                className="close"
                onClick={closeEditor}
              >
                ×
              </button>
            </div>

            <form
              className="form"
              onSubmit={savePage}
            >
              <div className="editor-note">
                This editor writes directly to the CEVTEXA
                <strong> pages </strong>
                table. Publishing a page changes its database
                status to <strong>published</strong>; your public
                page components can then read published records
                through the existing RLS policy.
              </div>

              <div className="form-grid">
                <div className="field full">
                  <label>Page title *</label>

                  <input
                    className="input"
                    value={pageForm.title}
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value
                      )
                    }
                    placeholder="e.g. About CEVTEXA"
                    required
                  />
                </div>

                <div className="field">
                  <label>URL slug *</label>

                  <input
                    className="input"
                    value={pageForm.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        slugify(
                          event.target.value
                        )
                      )
                    }
                    placeholder="about"
                    required
                  />

                  <div className="field-help">
                    The page will use this value as its
                    unique database slug.
                  </div>
                </div>

                <div className="field">
                  <label>Publishing status</label>

                  <select
                    className="select"
                    value={pageForm.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    {PAGE_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {titleCase(status)}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="field full">
                  <label>Page content</label>

                  <textarea
                    className="textarea"
                    value={pageForm.content}
                    onChange={(event) =>
                      updateField(
                        "content",
                        event.target.value
                      )
                    }
                    placeholder="Write the page content here..."
                  />

                  <div className="field-help">
                    This field is stored as plain text in the
                    current database schema. Rich-text/visual
                    blocks can be added later without changing
                    the existing admin foundation.
                  </div>
                </div>

                <div className="field full">
                  <label>SEO title</label>

                  <input
                    className="input"
                    value={pageForm.seo_title}
                    onChange={(event) =>
                      updateField(
                        "seo_title",
                        event.target.value
                      )
                    }
                    placeholder="Page title for search engines"
                    maxLength={70}
                  />

                  <div className="seo-counter">
                    {pageForm.seo_title.length}/70
                  </div>
                </div>

                <div className="field full">
                  <label>SEO description</label>

                  <textarea
                    className="textarea"
                    style={{ minHeight: "120px" }}
                    value={
                      pageForm.seo_description
                    }
                    onChange={(event) =>
                      updateField(
                        "seo_description",
                        event.target.value
                      )
                    }
                    placeholder="Short description for search engines and social previews..."
                    maxLength={170}
                  />

                  <div className="seo-counter">
                    {pageForm.seo_description.length}/170
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingPage
                    ? "Save changes"
                    : "Create page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}