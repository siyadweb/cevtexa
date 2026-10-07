"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

const EMPTY_SEO = {
  page_slug: "",
  title: "",
  description: "",
  keywords: "",
  og_image: "",
  canonical_url: "",
};

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SEOAdminPage() {
  const router = useRouter();

  const [supabase, setSupabase] = useState(null);
  const [settings, setSettings] = useState([]);
  const [pages, setPages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SEO);

  const loadSEO = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    setError("");

    try {
      const [{ data: seoData, error: seoError }, { data: pageData }] =
        await Promise.all([
          supabase
            .from("seo_settings")
            .select(
              "id,page_slug,title,description,keywords,og_image,canonical_url,updated_at"
            )
            .order("updated_at", { ascending: false }),

          supabase
            .from("pages")
            .select("id,title,slug,status")
            .order("title", { ascending: true }),
        ]);

      if (seoError) throw seoError;

      setSettings(seoData || []);
      setPages(pageData || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load SEO settings.");
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
      loadSEO();
    }
  }, [supabase, loadSEO]);

  const pageMap = useMemo(
    () => new Map(pages.map((page) => [page.slug, page])),
    [pages]
  );

  const rows = useMemo(() => {
    const configured = new Map(
      settings.map((setting) => [setting.page_slug, setting])
    );

    const pageRows = pages.map((page) => {
      const seo = configured.get(page.slug);

      return {
        id: seo?.id || null,
        page_slug: page.slug,
        page_title: page.title,
        page_status: page.status,
        title: seo?.title || "",
        description: seo?.description || "",
        keywords: seo?.keywords || "",
        og_image: seo?.og_image || "",
        canonical_url: seo?.canonical_url || "",
        updated_at: seo?.updated_at || null,
        configured: Boolean(seo),
      };
    });

    const standaloneSEO = settings
      .filter((setting) => !pageMap.has(setting.page_slug))
      .map((setting) => ({
        ...setting,
        page_title: setting.page_slug,
        page_status: "standalone",
        configured: true,
      }));

    return [...pageRows, ...standaloneSEO];
  }, [pages, settings, pageMap]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        [
          row.page_slug,
          row.page_title,
          row.title,
          row.description,
          row.keywords,
          row.canonical_url,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "configured" && row.configured) ||
        (filter === "missing" && !row.configured);

      return matchesSearch && matchesFilter;
    });
  }, [rows, search, filter]);

  const stats = useMemo(() => {
    const configured = rows.filter((row) => row.configured).length;
    const missing = rows.filter((row) => !row.configured).length;

    const complete = rows.filter(
      (row) =>
        row.title &&
        row.description &&
        row.canonical_url
    ).length;

    return {
      total: rows.length,
      configured,
      missing,
      complete,
    };
  }, [rows]);

  function openEditor(row) {
    setEditingId(row.id);

    setForm({
      page_slug: row.page_slug || "",
      title: row.title || "",
      description: row.description || "",
      keywords: row.keywords || "",
      og_image: row.og_image || "",
      canonical_url: row.canonical_url || "",
    });

    setError("");
    setNotice("");
    setShowEditor(true);
  }

  function openNewEditor() {
    setEditingId(null);
    setForm(EMPTY_SEO);
    setError("");
    setNotice("");
    setShowEditor(true);
  }

  function closeEditor() {
    if (saving) return;

    setShowEditor(false);
    setEditingId(null);
    setForm(EMPTY_SEO);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePageSelect(value) {
    const existing = settings.find(
      (setting) => setting.page_slug === value
    );

    if (existing) {
      setEditingId(existing.id);

      setForm({
        page_slug: existing.page_slug || "",
        title: existing.title || "",
        description: existing.description || "",
        keywords: existing.keywords || "",
        og_image: existing.og_image || "",
        canonical_url: existing.canonical_url || "",
      });

      return;
    }

    const page = pages.find((item) => item.slug === value);

    setEditingId(null);

    setForm({
      ...EMPTY_SEO,
      page_slug: value,
      title: page?.title || "",
      canonical_url: value
        ? `${window.location.origin}/${value}`
        : "",
    });
  }

  async function saveSEO(event) {
    event.preventDefault();

    if (!supabase) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const pageSlug = form.page_slug.trim().replace(/^\/+|\/+$/g, "");

      if (!pageSlug) {
        throw new Error("Page slug is required.");
      }

      const payload = {
        page_slug: pageSlug,
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        keywords: form.keywords.trim() || null,
        og_image: form.og_image.trim() || null,
        canonical_url: form.canonical_url.trim() || null,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("seo_settings")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("seo_settings")
          .upsert(payload, {
            onConflict: "page_slug",
          })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setNotice("SEO settings saved successfully.");

      closeEditor();
      await loadSEO();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save SEO settings.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSEO(row) {
    if (!supabase || !row.id) return;

    const confirmed = window.confirm(
      `Remove SEO settings for "${row.page_title}"?\n\nThe page itself will not be deleted.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const { error: deleteError } = await supabase
        .from("seo_settings")
        .delete()
        .eq("id", row.id);

      if (deleteError) throw deleteError;

      setNotice("SEO settings removed.");
      await loadSEO();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to remove SEO settings.");
    }
  }

  function clearMessages() {
    setError("");
    setNotice("");
  }

  return (
    <main className="seo-admin">
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

        .seo-admin {
          min-height: 100vh;
          padding: 58px 60px 100px;
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
        }

        .seo-shell {
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
          max-width: 800px;
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
          min-height: 140px;
          padding: 14px 15px;
          resize: vertical;
          line-height: 1.65;
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
          margin-bottom: 5px;
        }

        .slug {
          color: #557b99;
          font-size: 12px;
        }

        .seo-title {
          max-width: 280px;
          color: #b7cce0;
          font-size: 12px;
          line-height: 1.45;
        }

        .description {
          max-width: 300px;
          color: #637f97;
          font-size: 12px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .score {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .score.good {
          color: #6be9b3;
          background: rgba(35, 205, 137, 0.09);
        }

        .score.partial {
          color: #7edcff;
          background: rgba(41, 224, 255, 0.08);
        }

        .score.missing {
          color: #ffb3b3;
          background: rgba(255, 90, 90, 0.07);
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
          width: min(900px, 100%);
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

        .help {
          margin-top: 7px;
          color: #52728c;
          font-size: 11px;
          line-height: 1.5;
        }

        .counter {
          display: flex;
          justify-content: flex-end;
          margin-top: 5px;
          color: #52728c;
          font-size: 10px;
        }

        .preview {
          margin-top: 7px;
          padding: 12px;
          border-radius: 11px;
          border: 1px solid rgba(140, 180, 220, 0.08);
          background: rgba(255, 255, 255, 0.025);
          color: #7190a9;
          font-size: 11px;
          word-break: break-all;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px 25px 25px;
          border-top: 1px solid rgba(140, 180, 220, 0.1);
        }

        @media (max-width: 1200px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .table {
            min-width: 1050px;
          }

          .workspace {
            overflow-x: auto;
          }
        }

        @media (max-width: 950px) {
          .seo-admin {
            padding: 40px 24px 70px;
          }

          .topline {
            flex-direction: column;
          }

          .top-actions {
            justify-content: flex-start;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .seo-admin {
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

      <div className="seo-shell">
        <header className="topline">
          <div>
            <div className="eyebrow">DISCOVERABILITY / SEO</div>

            <h1 className="title">SEO</h1>

            <p className="subtitle">
              Manage page titles, descriptions, keywords, Open Graph assets
              and canonical URLs from one central SEO control panel.
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
              onClick={openNewEditor}
            >
              + New SEO entry
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
              Website pages available for SEO
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Configured</div>
            <div className="stat-value">{stats.configured}</div>
            <div className="stat-help">
              Pages with SEO records
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Missing</div>
            <div className="stat-value">{stats.missing}</div>
            <div className="stat-help">
              Pages without a dedicated SEO record
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Complete</div>
            <div className="stat-value">{stats.complete}</div>
            <div className="stat-help">
              Title + description + canonical URL
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="toolbar">
            <input
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search page, title, keywords..."
            />

            <select
              className="select"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All SEO entries</option>
              <option value="configured">Configured</option>
              <option value="missing">Missing SEO</option>
            </select>

            <button
              className="button"
              onClick={loadSEO}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="section-head">
            <div className="section-title">
              PAGE SEO
              <span className="section-count">
                {filteredRows.length} entries
              </span>
            </div>

            <button
              className="button small primary"
              onClick={openNewEditor}
            >
              + Add SEO
            </button>
          </div>

          {loading ? (
            <div className="empty">
              <strong>Loading SEO settings...</strong>
              Please wait.
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="empty">
              <strong>No SEO entries found</strong>
              Create an SEO entry for your website pages.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>SEO title</th>
                  <th>Description</th>
                  <th>Coverage</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const completedFields = [
                    row.title,
                    row.description,
                    row.canonical_url,
                  ].filter(Boolean).length;

                  const scoreClass =
                    completedFields === 3
                      ? "good"
                      : completedFields > 0
                      ? "partial"
                      : "missing";

                  return (
                    <tr key={row.id || row.page_slug}>
                      <td>
                        <div className="page-name">
                          {row.page_title || row.page_slug}
                        </div>

                        <div className="slug">
                          /{row.page_slug}
                        </div>
                      </td>

                      <td>
                        <div className="seo-title">
                          {row.title || "No SEO title"}
                        </div>
                      </td>

                      <td>
                        <div className="description">
                          {row.description ||
                            "No meta description"}
                        </div>
                      </td>

                      <td>
                        <span className={`score ${scoreClass}`}>
                          {completedFields}/3 complete
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            color: "#5c7b96",
                            fontSize: "13px",
                          }}
                        >
                          {formatDate(row.updated_at)}
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="button small"
                            onClick={() => openEditor(row)}
                          >
                            Edit
                          </button>

                          {row.id && (
                            <button
                              className="button small danger"
                              onClick={() => deleteSEO(row)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                  DISCOVERABILITY / PAGE SEO
                </div>

                <h2 className="modal-title">
                  {editingId
                    ? "Edit SEO settings"
                    : "Create SEO settings"}
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
              onSubmit={saveSEO}
            >
              <div className="form-grid">
                <div className="field full">
                  <label>Website page</label>

                  <select
                    className="select"
                    value={form.page_slug}
                    onChange={(event) =>
                      handlePageSelect(
                        event.target.value
                      )
                    }
                    disabled={Boolean(editingId)}
                  >
                    <option value="">
                      Select a page
                    </option>

                    {pages.map((page) => (
                      <option
                        key={page.id}
                        value={page.slug}
                      >
                        {page.title} — /{page.slug}
                      </option>
                    ))}
                  </select>

                  <div className="help">
                    The SEO record is uniquely connected
                    to this page slug.
                  </div>
                </div>

                <div className="field full">
                  <label>SEO title</label>

                  <input
                    className="input"
                    value={form.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value
                      )
                    }
                    maxLength={70}
                    placeholder="CEVTEXA — Digital Systems That Think Ahead"
                  />

                  <div className="counter">
                    {form.title.length}/70
                  </div>
                </div>

                <div className="field full">
                  <label>Meta description</label>

                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    maxLength={170}
                    placeholder="A concise description of this page for search engines."
                  />

                  <div className="counter">
                    {form.description.length}/170
                  </div>
                </div>

                <div className="field full">
                  <label>Keywords</label>

                  <input
                    className="input"
                    value={form.keywords}
                    onChange={(event) =>
                      updateField(
                        "keywords",
                        event.target.value
                      )
                    }
                    placeholder="web development, AI automation, digital growth"
                  />

                  <div className="help">
                    Separate keywords with commas.
                  </div>
                </div>

                <div className="field full">
                  <label>Open Graph image URL</label>

                  <input
                    className="input"
                    value={form.og_image}
                    onChange={(event) =>
                      updateField(
                        "og_image",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />

                  {form.og_image && (
                    <div className="preview">
                      {form.og_image}
                    </div>
                  )}
                </div>

                <div className="field full">
                  <label>Canonical URL</label>

                  <input
                    className="input"
                    value={form.canonical_url}
                    onChange={(event) =>
                      updateField(
                        "canonical_url",
                        event.target.value
                      )
                    }
                    placeholder="https://cevtexa.com/about"
                  />

                  <div className="help">
                    The preferred URL for this page.
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
                    : "Save SEO settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}