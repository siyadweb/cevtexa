"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/app/lib/supabase";

const supabase = getSupabaseClient();

const emptyForm = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  client_name: "",
  industry: "",
  services: "",
  cover_image: "",
  project_url: "",
  featured: false,
  is_published: false,
};

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      await loadProjects();
    } catch (err) {
      console.error(err);
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    const { data, error: loadError } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error(loadError);
      setError(loadError.message || "Unable to load projects.");
      return;
    }

    setProjects(data || []);
  }

  function openCreate() {
    setSelectedProject(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEdit(project) {
    setSelectedProject(project);

    setForm({
      title: project.title || "",
      slug: project.slug || "",
      short_description: project.short_description || "",
      description: project.description || "",
      client_name: project.client_name || "",
      industry: project.industry || "",
      services: Array.isArray(project.services)
        ? project.services.join(", ")
        : "",
      cover_image: project.cover_image || "",
      project_url: project.project_url || "",
      featured: Boolean(project.featured),
      is_published: Boolean(project.is_published),
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTitleChange(value) {
    setForm((current) => ({
      ...current,
      title: value,
      slug:
        current.slug === "" ||
        current.slug === makeSlug(current.title)
          ? makeSlug(value)
          : current.slug,
    }));
  }

  async function saveProject(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const title = form.title.trim();

    if (!title) {
      setError("Project title is required.");
      setSaving(false);
      return;
    }

    const slug = form.slug.trim() || makeSlug(title);

    const services = form.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      short_description:
        form.short_description.trim() || null,
      description: form.description.trim() || null,
      client_name: form.client_name.trim() || null,
      industry: form.industry.trim() || null,
      services,
      cover_image: form.cover_image.trim() || null,
      project_url: form.project_url.trim() || null,
      featured: Boolean(form.featured),
      is_published: Boolean(form.is_published),
    };

    try {
      if (selectedProject) {
        const { error: updateError } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", selectedProject.id);

        if (updateError) {
          throw updateError;
        }

        setMessage("Project updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("projects")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setMessage("Project created successfully.");
      }

      await loadProjects();

      setTimeout(() => {
        setShowForm(false);
        setSelectedProject(null);
      }, 500);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to save project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (deleteError) {
      console.error(deleteError);
      setError(deleteError.message || "Unable to delete project.");
      return;
    }

    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
      setShowForm(false);
    }

    setMessage("Project deleted.");
    await loadProjects();
  }

  async function togglePublished(project) {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        is_published: !project.is_published,
      })
      .eq("id", project.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message || "Unable to update project.");
      return;
    }

    await loadProjects();
  }

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.title?.toLowerCase().includes(query) ||
        project.client_name?.toLowerCase().includes(query) ||
        project.industry?.toLowerCase().includes(query) ||
        project.slug?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" &&
          project.is_published) ||
        (statusFilter === "draft" &&
          !project.is_published);

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const publishedCount = projects.filter(
    (project) => project.is_published
  ).length;

  const draftCount =
    projects.length - publishedCount;

  const featuredCount = projects.filter(
    (project) => project.featured
  ).length;

  return (
    <main className="admin-projects-page">
      <section className="admin-projects-header">
        <div>
          <div className="admin-eyebrow">
            PORTFOLIO
          </div>

          <h1>Projects</h1>

          <p>
            Manage the work displayed across the
            CEVTEXA portfolio.
          </p>
        </div>

        <div className="admin-projects-header-actions">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() =>
              router.push("/admin")
            }
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={openCreate}
          >
            + New project
          </button>
        </div>
      </section>

      <section className="admin-project-stats">
        <div className="admin-project-stat">
          <span>Total</span>
          <strong>{projects.length}</strong>
          <small>Portfolio records</small>
        </div>

        <div className="admin-project-stat">
          <span>Published</span>
          <strong>{publishedCount}</strong>
          <small>Visible on website</small>
        </div>

        <div className="admin-project-stat">
          <span>Drafts</span>
          <strong>{draftCount}</strong>
          <small>Not publicly visible</small>
        </div>

        <div className="admin-project-stat">
          <span>Featured</span>
          <strong>{featuredCount}</strong>
          <small>Highlighted work</small>
        </div>
      </section>

      {message && (
        <div className="admin-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <section className="admin-project-panel">
        <div className="admin-project-toolbar">
          <input
            type="text"
            placeholder="Search projects, clients, industry..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">
              All projects
            </option>

            <option value="published">
              Published
            </option>

            <option value="draft">
              Drafts
            </option>
          </select>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadProjects}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            <div className="admin-loading-dot" />
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              ◇
            </div>

            <h3>No projects found</h3>

            <p>
              Create your first portfolio project
              to start building the work library.
            </p>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openCreate}
            >
              + Create project
            </button>
          </div>
        ) : (
          <div className="admin-project-table-wrap">
            <table className="admin-project-table">
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>CLIENT</th>
                  <th>INDUSTRY</th>
                  <th>STATUS</th>
                  <th>FEATURED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredProjects.map(
                  (project) => (
                    <tr key={project.id}>
                      <td>
                        <div className="project-name-cell">
                          <div className="project-avatar">
                            {project.title
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>

                          <div>
                            <strong>
                              {project.title}
                            </strong>

                            <span>
                              /{project.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {project.client_name ||
                          "—"}
                      </td>

                      <td>
                        {project.industry ||
                          "—"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            project.is_published
                              ? "project-status published"
                              : "project-status draft"
                          }
                          onClick={() =>
                            togglePublished(
                              project
                            )
                          }
                        >
                          {project.is_published
                            ? "Published"
                            : "Draft"}
                        </button>
                      </td>

                      <td>
                        {project.featured ? (
                          <span className="project-featured">
                            Featured
                          </span>
                        ) : (
                          <span className="project-muted">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="project-actions">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(project)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              deleteProject(
                                project
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowForm(false);
            }
          }}
        >
          <div className="admin-project-modal">
            <div className="admin-modal-header">
              <div>
                <div className="admin-eyebrow">
                  {selectedProject
                    ? "EDIT PROJECT"
                    : "NEW PROJECT"}
                </div>

                <h2>
                  {selectedProject
                    ? "Update project"
                    : "Create project"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveProject}
              className="admin-project-form"
            >
              <div className="project-form-grid">
                <label>
                  Project title *
                  <input
                    value={form.title}
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value
                      )
                    }
                    placeholder="e.g. CEVTEXA AI Platform"
                    required
                  />
                </label>

                <label>
                  Slug *
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        makeSlug(
                          event.target.value
                        )
                      )
                    }
                    placeholder="cevtexa-ai-platform"
                    required
                  />
                </label>

                <label>
                  Client
                  <input
                    value={form.client_name}
                    onChange={(event) =>
                      updateField(
                        "client_name",
                        event.target.value
                      )
                    }
                    placeholder="Client name"
                  />
                </label>

                <label>
                  Industry
                  <input
                    value={form.industry}
                    onChange={(event) =>
                      updateField(
                        "industry",
                        event.target.value
                      )
                    }
                    placeholder="Technology"
                  />
                </label>
              </div>

              <label>
                Short description
                <textarea
                  rows="3"
                  value={
                    form.short_description
                  }
                  onChange={(event) =>
                    updateField(
                      "short_description",
                      event.target.value
                    )
                  }
                  placeholder="Short project summary..."
                />
              </label>

              <label>
                Full description
                <textarea
                  rows="6"
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Detailed project description..."
                />
              </label>

              <label>
                Services
                <input
                  value={form.services}
                  onChange={(event) =>
                    updateField(
                      "services",
                      event.target.value
                    )
                  }
                  placeholder="Web Development, AI, Automation"
                />

                <small>
                  Separate services with commas.
                </small>
              </label>

              <div className="project-form-grid">
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

                <label>
                  Project URL
                  <input
                    value={form.project_url}
                    onChange={(event) =>
                      updateField(
                        "project_url",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div className="project-checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateField(
                        "featured",
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    Featured project
                  </span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(event) =>
                      updateField(
                        "is_published",
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    Publish on website
                  </span>
                </label>
              </div>

              {error && (
                <div className="admin-error-message">
                  {error}
                </div>
              )}

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : selectedProject
                    ? "Save changes"
                    : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-projects-page {
          min-height: 100vh;
          padding: 44px 56px 80px;
          color: #eceff5;
        }

        .admin-projects-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 38px;
        }

        .admin-eyebrow {
          color: #5faeff;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          margin-bottom: 12px;
        }

        .admin-projects-header h1 {
          margin: 0;
          font-size: clamp(48px, 6vw, 76px);
          line-height: 0.95;
          letter-spacing: -0.055em;
        }

        .admin-projects-header p {
          margin: 18px 0 0;
          color: #7f98b7;
          font-size: 15px;
        }

        .admin-projects-header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .admin-primary-button,
        .admin-secondary-button,
        .admin-refresh-button {
          min-height: 44px;
          border-radius: 10px;
          padding: 0 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          font-size: 13px;
          transition: 0.2s ease;
        }

        .admin-primary-button {
          color: #00111a;
          border: 0;
          font-weight: 700;
          background: linear-gradient(
            90deg,
            #2f7fff,
            #29e0ff
          );
        }

        .admin-primary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(
            41,
            224,
            255,
            0.15
          );
        }

        .admin-secondary-button {
          color: #b7c7dc;
          background: #071321;
        }

        .admin-secondary-button:hover,
        .admin-refresh-button:hover {
          border-color: rgba(
            41,
            224,
            255,
            0.4
          );
          color: #fff;
        }

        .admin-refresh-button {
          color: #8fdfff;
          background: #061522;
          border-color: rgba(
            41,
            224,
            255,
            0.22
          );
        }

        .admin-project-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 14px;
        }

        .admin-project-stat {
          min-height: 140px;
          padding: 24px;
          border-radius: 18px;
          border: 1px solid rgba(
            143,
            198,
            255,
            0.14
          );
          background: linear-gradient(
            145deg,
            rgba(9, 24, 41, 0.96),
            rgba(3, 12, 23, 0.96)
          );
        }

        .admin-project-stat span {
          display: block;
          color: #5d87b0;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .admin-project-stat strong {
          display: block;
          margin-top: 22px;
          font-size: 38px;
          line-height: 1;
        }

        .admin-project-stat small {
          display: block;
          margin-top: 9px;
          color: #53708f;
        }

        .admin-success-message,
        .admin-error-message {
          margin: 14px 0;
          padding: 13px 16px;
          border-radius: 10px;
          font-size: 13px;
        }

        .admin-success-message {
          color: #8defff;
          border: 1px solid rgba(
            41,
            224,
            255,
            0.2
          );
          background: rgba(
            41,
            224,
            255,
            0.05
          );
        }

        .admin-error-message {
          color: #ff9c9c;
          border: 1px solid rgba(
            255,
            90,
            90,
            0.25
          );
          background: rgba(
            255,
            60,
            60,
            0.06
          );
        }

        .admin-project-panel {
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(
            143,
            198,
            255,
            0.13
          );
          background: rgba(4, 14, 26, 0.8);
        }

        .admin-project-toolbar {
          display: grid;
          grid-template-columns: 1fr 190px auto;
          gap: 10px;
          padding: 20px;
          border-bottom: 1px solid rgba(
            255,
            255,
            255,
            0.06
          );
        }

        .admin-project-toolbar input,
        .admin-project-toolbar select {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border-radius: 9px;
          border: 1px solid rgba(
            143,
            198,
            255,
            0.16
          );
          background: #071625;
          color: #dce7f4;
          outline: none;
        }

        .admin-project-toolbar input:focus,
        .admin-project-toolbar select:focus {
          border-color: rgba(
            41,
            224,
            255,
            0.5
          );
        }

        .admin-project-table-wrap {
          overflow-x: auto;
        }

        .admin-project-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-project-table th {
          padding: 17px 20px;
          text-align: left;
          color: #527ca4;
          font-size: 9px;
          letter-spacing: 0.18em;
          font-weight: 600;
          border-bottom: 1px solid rgba(
            255,
            255,
            255,
            0.06
          );
        }

        .admin-project-table td {
          padding: 17px 20px;
          color: #9fb1c8;
          font-size: 13px;
          border-bottom: 1px solid rgba(
            255,
            255,
            255,
            0.045
          );
        }

        .admin-project-table tbody tr:hover {
          background: rgba(
            143,
            198,
            255,
            0.025
          );
        }

        .project-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .project-avatar {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #8eeaff;
          background: linear-gradient(
            145deg,
            #073253,
            #061321
          );
          border: 1px solid rgba(
            41,
            224,
            255,
            0.2
          );
          font-weight: 700;
        }

        .project-name-cell strong {
          display: block;
          color: #eaf1f8;
          font-size: 13px;
        }

        .project-name-cell span {
          display: block;
          margin-top: 4px;
          color: #4d6a87;
          font-size: 10px;
        }

        .project-status,
        .project-featured {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
        }

        .project-status {
          cursor: pointer;
          background: transparent;
        }

        .project-status.published {
          color: #78eaff;
          border: 1px solid rgba(
            41,
            224,
            255,
            0.25
          );
          background: rgba(
            41,
            224,
            255,
            0.05
          );
        }

        .project-status.draft {
          color: #9baabe;
          border: 1px solid rgba(
            255,
            255,
            255,
            0.1
          );
          background: rgba(
            255,
            255,
            255,
            0.03
          );
        }

        .project-featured {
          color: #8fc6ff;
          border: 1px solid rgba(
            143,
            198,
            255,
            0.2
          );
        }

        .project-muted {
          color: #40556d;
        }

        .project-actions {
          display: flex;
          gap: 8px;
        }

        .project-actions button {
          border: 0;
          background: transparent;
          color: #68bfff;
          cursor: pointer;
          font-size: 12px;
        }

        .project-actions button:hover {
          color: #fff;
        }

        .project-actions .danger {
          color: #e78282;
        }

        .admin-empty-state {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
          color: #6985a3;
        }

        .admin-empty-icon {
          font-size: 42px;
          color: #29e0ff;
          margin-bottom: 12px;
        }

        .admin-empty-state h3 {
          margin: 0;
          color: #dce8f5;
          font-size: 18px;
        }

        .admin-empty-state p {
          max-width: 420px;
          margin: 10px 0 22px;
          line-height: 1.6;
        }

        .admin-loading-dot {
          width: 9px;
          height: 9px;
          margin-bottom: 14px;
          border-radius: 50%;
          background: #29e0ff;
          box-shadow: 0 0 18px #29e0ff;
          animation: projectPulse 1s infinite;
        }

        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: rgba(0, 5, 12, 0.78);
          backdrop-filter: blur(14px);
        }

        .admin-project-modal {
          width: min(860px, 100%);
          max-height: calc(100vh - 60px);
          overflow-y: auto;
          border-radius: 20px;
          border: 1px solid rgba(
            143,
            198,
            255,
            0.17
          );
          background: #06111e;
          box-shadow: 0 30px 100px rgba(
            0,
            0,
            0,
            0.55
          );
        }

        .admin-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 26px;
          border-bottom: 1px solid rgba(
            255,
            255,
            255,
            0.07
          );
        }

        .admin-modal-header h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.03em;
        }

        .admin-modal-close {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          border: 1px solid rgba(
            255,
            255,
            255,
            0.1
          );
          background: #0b1a2a;
          color: #b7c8dc;
          font-size: 23px;
          cursor: pointer;
        }

        .admin-project-form {
          display: grid;
          gap: 18px;
          padding: 26px;
        }

        .project-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .admin-project-form label {
          display: grid;
          gap: 8px;
          color: #82a3c5;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .admin-project-form input,
        .admin-project-form textarea {
          width: 100%;
          box-sizing: border-box;
          border-radius: 9px;
          border: 1px solid rgba(
            143,
            198,
            255,
            0.15
          );
          background: #081827;
          color: #e9f1f9;
          padding: 12px 13px;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          resize: vertical;
        }

        .admin-project-form input {
          height: 46px;
        }

        .admin-project-form input:focus,
        .admin-project-form textarea:focus {
          border-color: rgba(
            41,
            224,
            255,
            0.5
          );
        }

        .admin-project-form small {
          color: #506d8a;
          font-size: 10px;
          letter-spacing: normal;
          text-transform: none;
        }

        .project-checkbox-row {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
          padding: 4px 0;
        }

        .admin-project-form .checkbox-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #a8bad0;
          text-transform: none;
          letter-spacing: normal;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 17px;
          height: 17px;
          accent-color: #29e0ff;
        }

        .admin-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 8px;
        }

        @keyframes projectPulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 1000px) {
          .admin-projects-page {
            padding: 35px 25px 70px;
          }

          .admin-project-stats {
            grid-template-columns: 1fr 1fr;
          }

          .admin-project-toolbar {
            grid-template-columns: 1fr 1fr;
          }

          .admin-refresh-button {
            grid-column: span 2;
          }
        }

        @media (max-width: 700px) {
          .admin-projects-page {
            padding: 25px 16px 60px;
          }

          .admin-projects-header {
            flex-direction: column;
          }

          .admin-projects-header h1 {
            font-size: 48px;
          }

          .admin-projects-header-actions {
            width: 100%;
          }

          .admin-projects-header-actions button {
            flex: 1;
          }

          .admin-project-stats {
            grid-template-columns: 1fr;
          }

          .admin-project-toolbar {
            grid-template-columns: 1fr;
          }

          .admin-refresh-button {
            grid-column: auto;
          }

          .project-form-grid {
            grid-template-columns: 1fr;
          }

          .admin-modal-backdrop {
            padding: 10px;
          }

          .admin-project-modal {
            max-height: calc(100vh - 20px);
          }
        }
      `}</style>
    </main>
  );
}