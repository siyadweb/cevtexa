"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

const EMPTY_FORM = {
  project_id: "",
  title: "",
  slug: "",
  challenge: "",
  solution: "",
  results: "",
  content: "",
  cover_image: "",
  is_published: false,
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

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CaseStudiesAdminPage() {
  const router = useRouter();

  const [supabase] = useState(() => getSupabaseClient());

  const [user, setUser] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selected, setSelected] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!currentUser) {
        router.replace("/admin/login");
        return;
      }

      setUser(currentUser);

      await loadData();
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [caseStudyResult, projectResult] = await Promise.all([
        supabase
          .from("case_studies")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("projects")
          .select("id, title, slug")
          .order("title", { ascending: true }),
      ]);

      if (caseStudyResult.error) {
        throw caseStudyResult.error;
      }

      if (projectResult.error) {
        throw projectResult.error;
      }

      setCaseStudies(caseStudyResult.data || []);
      setProjects(projectResult.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load case studies. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCaseStudies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return caseStudies.filter((item) => {
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.slug?.toLowerCase().includes(query) ||
        item.challenge?.toLowerCase().includes(query) ||
        item.solution?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && item.is_published) ||
        (filter === "draft" && !item.is_published);

      return matchesSearch && matchesFilter;
    });
  }, [caseStudies, search, filter]);

  const stats = useMemo(() => {
    const total = caseStudies.length;
    const published = caseStudies.filter(
      (item) => item.is_published
    ).length;

    return {
      total,
      published,
      drafts: total - published,
    };
  }, [caseStudies]);

  function openCreate() {
    setSelected(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setEditorOpen(true);
  }

  function openEdit(item) {
    setSelected(item);

    setForm({
      project_id: item.project_id || "",
      title: item.title || "",
      slug: item.slug || "",
      challenge: item.challenge || "",
      solution: item.solution || "",
      results: item.results || "",
      content: item.content || "",
      cover_image: item.cover_image || "",
      is_published: Boolean(item.is_published),
    });

    setError("");
    setSuccess("");
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;

    setEditorOpen(false);
    setSelected(null);
    setForm(EMPTY_FORM);
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
        current.slug &&
        current.slug !== makeSlug(current.title)
          ? current.slug
          : makeSlug(value),
    }));
  }

  async function saveCaseStudy(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Case study title is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        project_id: form.project_id || null,
        title: form.title.trim(),
        slug: makeSlug(form.slug),
        challenge: form.challenge.trim() || null,
        solution: form.solution.trim() || null,
        results: form.results.trim() || null,
        content: form.content.trim() || null,
        cover_image: form.cover_image.trim() || null,
        is_published: Boolean(form.is_published),
      };

      let result;

      if (selected?.id) {
        result = await supabase
          .from("case_studies")
          .update(payload)
          .eq("id", selected.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("case_studies")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(
        selected
          ? "Case study updated successfully."
          : "Case study created successfully."
      );

      await loadData();

      setTimeout(() => {
        setEditorOpen(false);
        setSelected(null);
        setForm(EMPTY_FORM);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error(err);

      if (err?.code === "23505") {
        setError(
          "This slug already exists. Please use a different slug."
        );
      } else {
        setError(
          err?.message ||
            "Unable to save the case study."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item) {
    setError("");
    setSuccess("");

    try {
      const result = await supabase
        .from("case_studies")
        .update({
          is_published: !item.is_published,
        })
        .eq("id", item.id);

      if (result.error) {
        throw result.error;
      }

      setCaseStudies((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                is_published: !entry.is_published,
              }
            : entry
        )
      );

      setSuccess(
        item.is_published
          ? "Case study moved to drafts."
          : "Case study published."
      );

      setTimeout(() => setSuccess(""), 1800);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to change publication status."
      );
    }
  }

  async function deleteCaseStudy(item) {
    const confirmed = window.confirm(
      `Delete "${item.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const result = await supabase
        .from("case_studies")
        .delete()
        .eq("id", item.id);

      if (result.error) {
        throw result.error;
      }

      setCaseStudies((current) =>
        current.filter((entry) => entry.id !== item.id)
      );

      if (selected?.id === item.id) {
        closeEditor();
      }

      setSuccess("Case study deleted.");
      setTimeout(() => setSuccess(""), 1800);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to delete the case study."
      );
    }
  }

  function projectName(projectId) {
    if (!projectId) return "No linked project";

    const project = projects.find(
      (item) => item.id === projectId
    );

    return project?.title || "Linked project";
  }

  if (!user && loading) {
    return (
      <main className="cs-page">
        <div className="cs-loading">
          <div className="cs-spinner" />
          <p>Loading case studies...</p>
        </div>

        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="cs-page">
      <section className="cs-shell">
        <header className="cs-header">
          <div>
            <div className="cs-eyebrow">
              PORTFOLIO / STORIES
            </div>

            <h1>Case Studies</h1>

            <p>
              Turn completed projects into detailed stories
              that show the challenge, solution and outcome.
            </p>
          </div>

          <div className="cs-header-actions">
            <button
              className="cs-secondary-btn"
              onClick={() => router.push("/admin")}
            >
              ← Dashboard
            </button>

            <button
              className="cs-primary-btn"
              onClick={openCreate}
            >
              + New case study
            </button>
          </div>
        </header>

        {error && (
          <div className="cs-alert cs-error">
            <span>!</span>
            <div>{error}</div>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {success && (
          <div className="cs-alert cs-success">
            <span>✓</span>
            <div>{success}</div>
          </div>
        )}

        <section className="cs-stats">
          <StatCard
            label="Total"
            value={stats.total}
            description="Case studies"
          />

          <StatCard
            label="Published"
            value={stats.published}
            description="Visible on website"
            accent
          />

          <StatCard
            label="Drafts"
            value={stats.drafts}
            description="Not publicly visible"
          />
        </section>

        <section className="cs-panel">
          <div className="cs-toolbar">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search title, slug, challenge..."
              className="cs-search"
            />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="cs-select"
            >
              <option value="all">All case studies</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            <button
              className="cs-refresh-btn"
              onClick={loadData}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="cs-results-bar">
            <div>
              <span className="cs-mini-label">
                LIBRARY
              </span>

              <strong>
                {filteredCaseStudies.length}{" "}
                {filteredCaseStudies.length === 1
                  ? "case study"
                  : "case studies"}
              </strong>
            </div>

            <div className="cs-result-pills">
              <span>
                Published {stats.published}
              </span>

              <span>
                Drafts {stats.drafts}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="cs-empty">
              <div className="cs-spinner" />
              <h3>Loading...</h3>
            </div>
          ) : filteredCaseStudies.length === 0 ? (
            <div className="cs-empty">
              <div className="cs-empty-icon">◇</div>

              <h3>
                {caseStudies.length === 0
                  ? "No case studies yet"
                  : "No case studies found"}
              </h3>

              <p>
                {caseStudies.length === 0
                  ? "Create your first case study to start building the CEVTEXA work library."
                  : "Try changing your search or publication filter."}
              </p>

              {caseStudies.length === 0 && (
                <button
                  className="cs-primary-btn"
                  onClick={openCreate}
                >
                  + Create first case study
                </button>
              )}
            </div>
          ) : (
            <div className="cs-table-wrap">
              <table className="cs-table">
                <thead>
                  <tr>
                    <th>CASE STUDY</th>
                    <th>PROJECT</th>
                    <th>STATUS</th>
                    <th>UPDATED</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredCaseStudies.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cs-title-cell">
                          <div className="cs-avatar">
                            {item.title
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <strong>{item.title}</strong>

                            <span>
                              /{item.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="cs-project">
                          {projectName(item.project_id)}
                        </span>
                      </td>

                      <td>
                        <button
                          className={
                            item.is_published
                              ? "cs-status published"
                              : "cs-status draft"
                          }
                          onClick={() =>
                            togglePublished(item)
                          }
                        >
                          <span />
                          {item.is_published
                            ? "Published"
                            : "Draft"}
                        </button>
                      </td>

                      <td>
                        <span className="cs-date">
                          {formatDate(
                            item.updated_at ||
                              item.created_at
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="cs-row-actions">
                          <button
                            onClick={() =>
                              openEdit(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="danger"
                            onClick={() =>
                              deleteCaseStudy(item)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {editorOpen && (
        <div className="cs-overlay">
          <button
            className="cs-overlay-backdrop"
            onClick={closeEditor}
            aria-label="Close editor"
          />

          <aside className="cs-drawer">
            <div className="cs-drawer-header">
              <div>
                <span className="cs-eyebrow">
                  {selected
                    ? "EDIT CASE STUDY"
                    : "NEW CASE STUDY"}
                </span>

                <h2>
                  {selected
                    ? "Edit case study"
                    : "Create case study"}
                </h2>

                <p>
                  Build a polished project story for the
                  CEVTEXA portfolio.
                </p>
              </div>

              <button
                className="cs-close"
                onClick={closeEditor}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              className="cs-form"
              onSubmit={saveCaseStudy}
            >
              <div className="cs-form-section">
                <span className="cs-form-label">
                  BASIC INFORMATION
                </span>

                <label>
                  Title
                  <input
                    value={form.title}
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Nature Bliss Resort Platform"
                    required
                  />
                </label>

                <label>
                  Slug
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        makeSlug(event.target.value)
                      )
                    }
                    placeholder="nature-bliss-resort-platform"
                    required
                  />
                </label>

                <label>
                  Linked project
                  <select
                    value={form.project_id}
                    onChange={(event) =>
                      updateField(
                        "project_id",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      No linked project
                    </option>

                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.title}
                      </option>
                    ))}
                  </select>
                </label>

                {projects.length === 0 && (
                  <div className="cs-hint">
                    No projects exist yet. You can create
                    the case study without linking a project.
                  </div>
                )}
              </div>

              <div className="cs-form-section">
                <span className="cs-form-label">
                  PROJECT STORY
                </span>

                <label>
                  Challenge
                  <textarea
                    value={form.challenge}
                    onChange={(event) =>
                      updateField(
                        "challenge",
                        event.target.value
                      )
                    }
                    placeholder="What problem did the client need to solve?"
                    rows={5}
                  />
                </label>

                <label>
                  Solution
                  <textarea
                    value={form.solution}
                    onChange={(event) =>
                      updateField(
                        "solution",
                        event.target.value
                      )
                    }
                    placeholder="How did CEVTEXA solve the problem?"
                    rows={5}
                  />
                </label>

                <label>
                  Results
                  <textarea
                    value={form.results}
                    onChange={(event) =>
                      updateField(
                        "results",
                        event.target.value
                      )
                    }
                    placeholder="What changed after launch?"
                    rows={5}
                  />
                </label>

                <label>
                  Full content
                  <textarea
                    value={form.content}
                    onChange={(event) =>
                      updateField(
                        "content",
                        event.target.value
                      )
                    }
                    placeholder="Additional case study content..."
                    rows={8}
                  />
                </label>
              </div>

              <div className="cs-form-section">
                <span className="cs-form-label">
                  MEDIA
                </span>

                <label>
                  Cover image URL
                  <input
                    value={form.cover_image}
                    onChange={(event) =>
                      updateField(
                        "cover_image",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </label>

                {form.cover_image && (
                  <div className="cs-image-preview">
                    <img
                      src={form.cover_image}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="cs-publish-box">
                <div>
                  <strong>
                    Publish this case study
                  </strong>

                  <span>
                    Published case studies can be
                    displayed on the public website.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    form.is_published
                      ? "cs-toggle active"
                      : "cs-toggle"
                  }
                  onClick={() =>
                    updateField(
                      "is_published",
                      !form.is_published
                    )
                  }
                  aria-label="Toggle publication"
                >
                  <span />
                </button>
              </div>

              <div className="cs-form-footer">
                <button
                  type="button"
                  className="cs-secondary-btn"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cs-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : selected
                    ? "Save changes"
                    : "Create case study"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      <style jsx>{styles}</style>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
  accent = false,
}) {
  return (
    <div className="cs-stat-card">
      <span>{label}</span>

      <strong className={accent ? "accent" : ""}>
        {value}
      </strong>

      <small>{description}</small>
    </div>
  );
}

const styles = `
  .cs-page {
    min-height: 100vh;
    background:
      radial-gradient(
        circle at 75% 0%,
        rgba(24, 82, 150, 0.16),
        transparent 35%
      ),
      #02070d;
    color: #edf3fb;
    font-family: inherit;
  }

  .cs-shell {
    width: min(1500px, calc(100% - 72px));
    margin: 0 auto;
    padding: 56px 0 80px;
  }

  .cs-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 42px;
  }

  .cs-eyebrow {
    display: block;
    color: #5caeff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    margin-bottom: 14px;
  }

  .cs-header h1 {
    margin: 0;
    font-size: clamp(58px, 7vw, 96px);
    line-height: 0.95;
    letter-spacing: -0.065em;
    font-weight: 800;
  }

  .cs-header p {
    margin: 22px 0 0;
    max-width: 690px;
    color: #7893b2;
    font-size: 17px;
    line-height: 1.65;
  }

  .cs-header-actions {
    display: flex;
    gap: 12px;
    padding-top: 4px;
    flex-shrink: 0;
  }

  .cs-primary-btn,
  .cs-secondary-btn,
  .cs-refresh-btn {
    border: 1px solid rgba(99, 173, 255, 0.22);
    border-radius: 13px;
    min-height: 48px;
    padding: 0 20px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease;
  }

  .cs-primary-btn {
    color: #02101b;
    background: linear-gradient(
      100deg,
      #2787ff,
      #27d8ef
    );
    border-color: transparent;
  }

  .cs-secondary-btn,
  .cs-refresh-btn {
    color: #c9ddf2;
    background: rgba(5, 18, 31, 0.72);
  }

  .cs-refresh-btn {
    min-width: 110px;
  }

  .cs-primary-btn:hover,
  .cs-secondary-btn:hover,
  .cs-refresh-btn:hover {
    transform: translateY(-2px);
  }

  .cs-secondary-btn:hover,
  .cs-refresh-btn:hover {
    border-color: rgba(41, 224, 255, 0.4);
  }

  .cs-primary-btn:disabled,
  .cs-secondary-btn:disabled,
  .cs-refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .cs-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 14px;
  }

  .cs-alert > span {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cs-alert button {
    margin-left: auto;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 20px;
    cursor: pointer;
  }

  .cs-error {
    color: #ffb7c0;
    background: rgba(110, 18, 35, 0.2);
    border: 1px solid rgba(255, 90, 110, 0.2);
  }

  .cs-error > span {
    background: rgba(255, 90, 110, 0.16);
  }

  .cs-success {
    color: #9ceef8;
    background: rgba(19, 130, 155, 0.12);
    border: 1px solid rgba(41, 224, 255, 0.2);
  }

  .cs-success > span {
    background: rgba(41, 224, 255, 0.14);
  }

  .cs-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  .cs-stat-card {
    min-height: 164px;
    padding: 27px;
    border: 1px solid #183047;
    border-radius: 20px;
    background:
      linear-gradient(
        145deg,
        rgba(9, 24, 40, 0.94),
        rgba(3, 12, 21, 0.92)
      );
  }

  .cs-stat-card > span {
    display: block;
    color: #6193bf;
    font-size: 11px;
    letter-spacing: 0.17em;
    margin-bottom: 20px;
  }

  .cs-stat-card strong {
    display: block;
    font-size: 48px;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .cs-stat-card strong.accent {
    color: #29e0ff;
  }

  .cs-stat-card small {
    display: block;
    margin-top: 15px;
    color: #587492;
    font-size: 13px;
  }

  .cs-panel {
    overflow: hidden;
    border: 1px solid #173047;
    border-radius: 22px;
    background: rgba(3, 12, 21, 0.78);
  }

  .cs-toolbar {
    display: grid;
    grid-template-columns: 1fr 230px 115px;
    gap: 10px;
    padding: 22px;
    border-bottom: 1px solid #12283b;
  }

  .cs-search,
  .cs-select,
  .cs-form input,
  .cs-form select,
  .cs-form textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #1c3850;
    outline: none;
    border-radius: 11px;
    background: #061522;
    color: #dcecff;
    font: inherit;
    font-size: 14px;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .cs-search,
  .cs-select {
    height: 48px;
    padding: 0 15px;
  }

  .cs-search::placeholder,
  .cs-form textarea::placeholder,
  .cs-form input::placeholder {
    color: #4d6883;
  }

  .cs-search:focus,
  .cs-select:focus,
  .cs-form input:focus,
  .cs-form select:focus,
  .cs-form textarea:focus {
    border-color: rgba(41, 224, 255, 0.55);
    box-shadow: 0 0 0 3px rgba(41, 224, 255, 0.06);
  }

  .cs-results-bar {
    min-height: 76px;
    padding: 0 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #12283b;
  }

  .cs-results-bar > div:first-child {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .cs-mini-label {
    color: #4f83af;
    font-size: 10px;
    letter-spacing: 0.18em;
  }

  .cs-results-bar strong {
    font-size: 15px;
  }

  .cs-result-pills {
    display: flex;
    gap: 8px;
  }

  .cs-result-pills span {
    padding: 8px 11px;
    border-radius: 9px;
    background: #081625;
    color: #6f8eac;
    font-size: 12px;
  }

  .cs-table-wrap {
    overflow-x: auto;
  }

  .cs-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }

  .cs-table th {
    padding: 17px 22px;
    text-align: left;
    color: #527a9e;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    border-bottom: 1px solid #12283b;
  }

  .cs-table td {
    padding: 18px 22px;
    border-bottom: 1px solid rgba(24, 48, 69, 0.65);
    vertical-align: middle;
  }

  .cs-table tbody tr {
    transition: background 160ms ease;
  }

  .cs-table tbody tr:hover {
    background: rgba(22, 66, 102, 0.1);
  }

  .cs-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .cs-title-cell {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .cs-avatar {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: linear-gradient(
      145deg,
      #0c4269,
      #09243b
    );
    border: 1px solid #1a5c83;
    color: #70dfff;
    font-size: 13px;
    font-weight: 700;
  }

  .cs-title-cell strong {
    display: block;
    font-size: 14px;
    color: #e8f2fc;
  }

  .cs-title-cell span {
    display: block;
    margin-top: 5px;
    color: #52718f;
    font-size: 12px;
  }

  .cs-project {
    color: #89a9c7;
    font-size: 13px;
  }

  .cs-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid;
    border-radius: 999px;
    padding: 7px 11px;
    background: transparent;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  .cs-status span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .cs-status.published {
    color: #6ce8f4;
    border-color: rgba(41, 224, 255, 0.25);
    background: rgba(41, 224, 255, 0.06);
  }

  .cs-status.published span {
    background: #29e0ff;
    box-shadow: 0 0 10px #29e0ff;
  }

  .cs-status.draft {
    color: #899db2;
    border-color: #26394b;
    background: rgba(120, 145, 165, 0.05);
  }

  .cs-status.draft span {
    background: #617386;
  }

  .cs-date {
    color: #5d7893;
    font-size: 12px;
  }

  .cs-row-actions {
    display: flex;
    justify-content: flex-end;
    gap: 7px;
  }

  .cs-row-actions button {
    border: 1px solid #1b354b;
    border-radius: 8px;
    padding: 8px 10px;
    background: #071624;
    color: #8faecc;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  .cs-row-actions button:hover {
    border-color: #29a6cf;
    color: #dff8ff;
  }

  .cs-row-actions button.danger:hover {
    border-color: rgba(255, 80, 100, 0.45);
    color: #ff9da9;
  }

  .cs-empty {
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
  }

  .cs-empty-icon {
    font-size: 55px;
    color: #29e0ff;
    margin-bottom: 15px;
  }

  .cs-empty h3 {
    margin: 0;
    font-size: 21px;
  }

  .cs-empty p {
    max-width: 480px;
    margin: 10px 0 24px;
    color: #63819f;
    line-height: 1.6;
  }

  .cs-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 15px;
    color: #7593af;
  }

  .cs-spinner {
    width: 26px;
    height: 26px;
    border: 2px solid #19344b;
    border-top-color: #29e0ff;
    border-radius: 50%;
    animation: cs-spin 700ms linear infinite;
  }

  @keyframes cs-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .cs-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
  }

  .cs-overlay-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(0, 5, 10, 0.72);
    backdrop-filter: blur(8px);
    cursor: default;
  }

  .cs-drawer {
    position: relative;
    width: min(680px, 100%);
    height: 100%;
    overflow-y: auto;
    border-left: 1px solid #1a354d;
    background:
      radial-gradient(
        circle at 100% 0%,
        rgba(27, 104, 172, 0.13),
        transparent 35%
      ),
      #030b13;
    box-shadow: -30px 0 80px rgba(0, 0, 0, 0.45);
  }

  .cs-drawer-header {
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 30px;
    border-bottom: 1px solid #153047;
    background: rgba(3, 11, 19, 0.94);
    backdrop-filter: blur(16px);
  }

  .cs-drawer-header h2 {
    margin: 0;
    font-size: 30px;
    letter-spacing: -0.04em;
  }

  .cs-drawer-header p {
    margin: 9px 0 0;
    color: #6785a2;
    font-size: 13px;
    line-height: 1.5;
  }

  .cs-close {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border: 1px solid #1b354a;
    border-radius: 11px;
    background: #071522;
    color: #9cb6cf;
    font-size: 25px;
    cursor: pointer;
  }

  .cs-close:hover {
    color: #fff;
    border-color: #29a6cf;
  }

  .cs-form {
    padding: 28px 30px 40px;
  }

  .cs-form-section {
    padding-bottom: 28px;
    margin-bottom: 28px;
    border-bottom: 1px solid #12283a;
  }

  .cs-form-label {
    display: block;
    margin-bottom: 19px;
    color: #4f91c1;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
  }

  .cs-form label {
    display: block;
    margin-bottom: 17px;
    color: #abc0d5;
    font-size: 13px;
    font-weight: 500;
  }

  .cs-form input,
  .cs-form select {
    height: 48px;
    margin-top: 8px;
    padding: 0 14px;
  }

  .cs-form textarea {
    display: block;
    margin-top: 8px;
    padding: 13px 14px;
    min-height: 110px;
    resize: vertical;
    line-height: 1.6;
  }

  .cs-hint {
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(41, 139, 180, 0.06);
    border: 1px solid rgba(41, 139, 180, 0.14);
    color: #6686a2;
    font-size: 12px;
    line-height: 1.5;
  }

  .cs-image-preview {
    overflow: hidden;
    height: 180px;
    margin-top: -4px;
    margin-bottom: 16px;
    border: 1px solid #19354b;
    border-radius: 12px;
    background: #06111c;
  }

  .cs-image-preview img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .cs-publish-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
    padding: 17px;
    border: 1px solid #18334a;
    border-radius: 13px;
    background: rgba(7, 24, 39, 0.65);
  }

  .cs-publish-box strong {
    display: block;
    color: #dbeafa;
    font-size: 14px;
  }

  .cs-publish-box span:not(.cs-toggle span) {
    display: block;
    margin-top: 5px;
    color: #617f9b;
    font-size: 12px;
    line-height: 1.4;
  }

  .cs-toggle {
    position: relative;
    width: 48px;
    height: 27px;
    flex-shrink: 0;
    border: 0;
    border-radius: 99px;
    background: #162a3b;
    cursor: pointer;
  }

  .cs-toggle span {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 19px;
    height: 19px;
    border-radius: 50%;
    background: #6a8095;
    transition: transform 180ms ease;
  }

  .cs-toggle.active {
    background: #087c9b;
  }

  .cs-toggle.active span {
    background: #8ef4ff;
    transform: translateX(21px);
  }

  .cs-form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  @media (max-width: 900px) {
    .cs-shell {
      width: min(100% - 32px, 1500px);
      padding-top: 35px;
    }

    .cs-header {
      flex-direction: column;
    }

    .cs-header-actions {
      width: 100%;
    }

    .cs-header-actions button {
      flex: 1;
    }

    .cs-toolbar {
      grid-template-columns: 1fr;
    }

    .cs-stats {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .cs-shell {
      width: calc(100% - 22px);
    }

    .cs-header h1 {
      font-size: 52px;
    }

    .cs-header p {
      font-size: 15px;
    }

    .cs-results-bar {
      align-items: flex-start;
      flex-direction: column;
      justify-content: center;
      gap: 12px;
      padding: 18px 16px;
    }

    .cs-result-pills {
      flex-wrap: wrap;
    }

    .cs-drawer-header,
    .cs-form {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
`;