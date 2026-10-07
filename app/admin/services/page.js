"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  icon: "",
  status: "draft",
  featured: false,
  display_order: 0,
};

export default function AdminServicesPage() {
  const [supabase, setSupabase] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      const client = getSupabaseClient();
      setSupabase(client);
      loadServices(client);
    } catch (err) {
      setError(err.message || "Supabase is not configured.");
      setLoading(false);
    }
  }, []);

  async function loadServices(client = supabase) {
    if (!client) return;

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await client
      .from("services")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setServices([]);
    } else {
      setServices(data || []);
    }

    setLoading(false);
  }

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !query ||
        service.title?.toLowerCase().includes(query) ||
        service.slug?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && service.status === "published") ||
        (filter === "draft" && service.status !== "published") ||
        (filter === "featured" && service.featured === true);

      return matchesSearch && matchesFilter;
    });
  }, [services, search, filter]);

  const stats = {
    total: services.length,
    published: services.filter((item) => item.status === "published").length,
    drafts: services.filter((item) => item.status !== "published").length,
    featured: services.filter((item) => item.featured === true).length,
  };

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      display_order: services.length,
    });
    setShowForm(true);
    setError("");
  }

  function openEdit(service) {
    setEditing(service);
    setForm({
      title: service.title || "",
      slug: service.slug || "",
      description: service.description || "",
      icon: service.icon || "",
      status: service.status || "draft",
      featured: Boolean(service.featured),
      display_order: service.display_order ?? 0,
    });
    setShowForm(true);
    setError("");
  }

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function makeSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function saveService(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!form.title.trim()) {
      setError("Service title is required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || makeSlug(form.title),
      description: form.description.trim(),
      icon: form.icon.trim(),
      status: form.status,
      featured: form.featured,
      display_order: Number(form.display_order) || 0,
    };

    let result;

    if (editing) {
      result = await supabase
        .from("services")
        .update(payload)
        .eq("id", editing.id);
    } else {
      result = await supabase.from("services").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);

    await loadServices();
  }

  async function togglePublished(service) {
    if (!supabase) return;

    const nextStatus =
      service.status === "published" ? "draft" : "published";

    const { error: updateError } = await supabase
      .from("services")
      .update({ status: nextStatus })
      .eq("id", service.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadServices();
  }

  async function toggleFeatured(service) {
    if (!supabase) return;

    const { error: updateError } = await supabase
      .from("services")
      .update({ featured: !service.featured })
      .eq("id", service.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadServices();
  }

  async function deleteService(service) {
    if (!supabase) return;

    const confirmed = window.confirm(
      `Delete "${service.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadServices();
  }

  return (
    <main className="admin-content">
      <section className="admin-page-header">
        <div>
          <div className="admin-eyebrow">CONTENT / SERVICES</div>

          <h1>Services</h1>

          <p>
            Manage the services displayed across the CEVTEXA website.
          </p>
        </div>

        <div className="admin-header-actions">
          <a href="/admin" className="admin-secondary-button">
            ← Dashboard
          </a>

          <button
            type="button"
            className="admin-primary-button"
            onClick={openCreate}
          >
            + New service
          </button>
        </div>
      </section>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <section className="admin-stat-grid four">
        <StatCard
          label="Total"
          value={stats.total}
          description="All services"
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

        <StatCard
          label="Featured"
          value={stats.featured}
          description="Highlighted services"
        />
      </section>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search services, slug, description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All services</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="featured">Featured</option>
          </select>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={() => loadServices()}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="admin-table">
          <div className="admin-table-head services-grid">
            <span>SERVICE</span>
            <span>STATUS</span>
            <span>FEATURED</span>
            <span>ORDER</span>
            <span>ACTIONS</span>
          </div>

          {loading ? (
            <div className="admin-empty">
              Loading services...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">◇</div>
              <h3>No services found</h3>
              <p>
                Create your first service to start building the
                service library.
              </p>

              <button
                type="button"
                className="admin-primary-button"
                onClick={openCreate}
              >
                + Create service
              </button>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className="admin-table-row services-grid"
              >
                <div>
                  <strong>{service.title}</strong>

                  <small>
                    /{service.slug}
                  </small>

                  {service.description && (
                    <p>
                      {service.description}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    className={`status-pill ${
                      service.status === "published"
                        ? "published"
                        : "draft"
                    }`}
                    onClick={() => togglePublished(service)}
                  >
                    {service.status === "published"
                      ? "Published"
                      : "Draft"}
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    className={`feature-pill ${
                      service.featured ? "active" : ""
                    }`}
                    onClick={() => toggleFeatured(service)}
                  >
                    {service.featured
                      ? "Featured"
                      : "No"}
                  </button>
                </div>

                <div className="order-value">
                  {service.display_order ?? 0}
                </div>

                <div className="row-actions">
                  <button
                    type="button"
                    onClick={() => openEdit(service)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteService(service)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {showForm && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <div className="admin-eyebrow">
                  {editing ? "EDIT SERVICE" : "NEW SERVICE"}
                </div>

                <h2>
                  {editing
                    ? "Edit service"
                    : "Create service"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveService}>
              <div className="form-grid">
                <label>
                  <span>Service title</span>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateForm("title", event.target.value)
                    }
                    placeholder="Web & App Development"
                    required
                  />
                </label>

                <label>
                  <span>Slug</span>

                  <input
                    value={form.slug}
                    onChange={(event) =>
                      updateForm("slug", event.target.value)
                    }
                    placeholder="web-app-development"
                  />
                </label>

                <label className="full">
                  <span>Description</span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Describe this service..."
                    rows={5}
                  />
                </label>

                <label>
                  <span>Icon</span>

                  <input
                    value={form.icon}
                    onChange={(event) =>
                      updateForm("icon", event.target.value)
                    }
                    placeholder="code"
                  />
                </label>

                <label>
                  <span>Display order</span>

                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(event) =>
                      updateForm(
                        "display_order",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Status</span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">
                      Published
                    </option>
                  </select>
                </label>

                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateForm(
                        "featured",
                        event.target.checked
                      )
                    }
                  />

                  <span>Featured service</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setShowForm(false)}
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
                    : editing
                    ? "Save changes"
                    : "Create service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-content {
          min-height: 100vh;
          padding: 56px 52px 100px;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(47, 127, 255, 0.1),
              transparent 35%
            ),
            #02070d;
          color: #eceff5;
        }

        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 32px;
          margin-bottom: 48px;
        }

        .admin-eyebrow {
          color: #29e0ff;
          font-size: 12px;
          letter-spacing: 0.22em;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .admin-page-header h1 {
          margin: 0;
          font-size: clamp(58px, 7vw, 92px);
          line-height: 0.95;
          letter-spacing: -0.06em;
        }

        .admin-page-header p {
          margin: 22px 0 0;
          max-width: 650px;
          color: #8fa4bf;
          font-size: 18px;
        }

        .admin-header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .admin-primary-button,
        .admin-secondary-button,
        .admin-refresh-button {
          min-height: 50px;
          padding: 0 22px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font: inherit;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .admin-primary-button {
          color: #021018;
          background: linear-gradient(
            135deg,
            #2f7fff,
            #29e0ff
          );
          border: none;
          font-weight: 700;
        }

        .admin-secondary-button {
          color: #dce7f4;
          background: rgba(255, 255, 255, 0.025);
        }

        .admin-refresh-button {
          color: #29e0ff;
          background: rgba(41, 224, 255, 0.04);
        }

        .admin-error {
          margin-bottom: 24px;
          padding: 16px 18px;
          border: 1px solid rgba(255, 90, 90, 0.3);
          border-radius: 14px;
          background: rgba(255, 60, 60, 0.06);
          color: #ff9c9c;
        }

        .admin-stat-grid {
          display: grid;
          gap: 16px;
          margin-bottom: 16px;
        }

        .admin-stat-grid.four {
          grid-template-columns: repeat(4, 1fr);
        }

        .admin-stat-card {
          padding: 30px;
          min-height: 160px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          background: rgba(8, 20, 34, 0.72);
        }

        .admin-stat-card span {
          display: block;
          color: #7392b4;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .admin-stat-card strong {
          display: block;
          margin: 28px 0 8px;
          font-size: 48px;
          line-height: 1;
        }

        .admin-stat-card strong.accent {
          color: #29e0ff;
        }

        .admin-stat-card p {
          margin: 0;
          color: #55799f;
        }

        .admin-panel {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          background: rgba(4, 13, 23, 0.85);
        }

        .admin-toolbar {
          display: grid;
          grid-template-columns: 1fr 230px auto;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .admin-toolbar input,
        .admin-toolbar select,
        .form-grid input,
        .form-grid textarea,
        .form-grid select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: #081727;
          color: #edf4ff;
          padding: 15px 16px;
          outline: none;
          font: inherit;
        }

        .admin-toolbar input:focus,
        .admin-toolbar select:focus,
        .form-grid input:focus,
        .form-grid textarea:focus,
        .form-grid select:focus {
          border-color: rgba(41, 224, 255, 0.5);
        }

        .admin-table-head,
        .admin-table-row {
          display: grid;
          grid-template-columns: minmax(280px, 2fr) 1fr 1fr 0.7fr 1.2fr;
          gap: 20px;
          align-items: center;
          padding: 20px 24px;
        }

        .admin-table-head {
          color: #6385aa;
          font-size: 10px;
          letter-spacing: 0.18em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .admin-table-row {
          min-height: 110px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-table-row:last-child {
          border-bottom: none;
        }

        .admin-table-row strong {
          display: block;
          font-size: 16px;
        }

        .admin-table-row small {
          display: block;
          margin-top: 6px;
          color: #55799f;
        }

        .admin-table-row p {
          margin: 8px 0 0;
          color: #6d89a7;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 440px;
        }

        .status-pill,
        .feature-pill {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 8px 12px;
          background: transparent;
          color: #dce8f5;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
        }

        .status-pill.published {
          color: #29e0ff;
          border-color: rgba(41, 224, 255, 0.35);
        }

        .status-pill.draft {
          color: #8da1b8;
        }

        .feature-pill.active {
          color: #29e0ff;
          border-color: rgba(41, 224, 255, 0.35);
          background: rgba(41, 224, 255, 0.06);
        }

        .order-value {
          color: #9db1c9;
        }

        .row-actions {
          display: flex;
          gap: 8px;
        }

        .row-actions button {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          color: #c9d8e8;
          cursor: pointer;
        }

        .row-actions button.danger {
          color: #ff8e8e;
        }

        .admin-empty {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 50px;
          color: #7190b1;
        }

        .admin-empty-icon {
          font-size: 48px;
          color: #29e0ff;
          margin-bottom: 18px;
        }

        .admin-empty h3 {
          margin: 0 0 10px;
          color: #eaf1fa;
          font-size: 24px;
        }

        .admin-empty p {
          margin: 0 0 24px;
          max-width: 480px;
          line-height: 1.7;
        }

        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 4, 10, 0.82);
          backdrop-filter: blur(12px);
        }

        .admin-modal {
          width: min(760px, 100%);
          max-height: calc(100vh - 48px);
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          background: #06111e;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.5);
        }

        .admin-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-modal-header h2 {
          margin: 0;
          font-size: 30px;
        }

        .admin-close-button {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: transparent;
          color: #cbd8e7;
          font-size: 26px;
          cursor: pointer;
        }

        .admin-modal form {
          padding: 28px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-grid label {
          display: flex;
          flex-direction: column;
          gap: 9px;
          color: #91a9c2;
          font-size: 13px;
        }

        .form-grid label.full {
          grid-column: 1 / -1;
        }

        .form-grid textarea {
          resize: vertical;
        }

        .checkbox-field {
          flex-direction: row !important;
          align-items: center;
          justify-content: flex-start;
          padding-top: 30px;
        }

        .checkbox-field input {
          width: 18px;
          height: 18px;
        }

        .admin-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 1000px) {
          .admin-content {
            padding: 40px 24px 80px;
          }

          .admin-stat-grid.four {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-toolbar {
            grid-template-columns: 1fr;
          }

          .admin-table {
            overflow-x: auto;
          }

          .admin-table-head,
          .admin-table-row {
            min-width: 900px;
          }
        }

        @media (max-width: 650px) {
          .admin-page-header {
            flex-direction: column;
          }

          .admin-header-actions {
            width: 100%;
          }

          .admin-header-actions > * {
            flex: 1;
          }

          .admin-stat-grid.four {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-grid label.full {
            grid-column: auto;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({ label, value, description, accent }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>

      <strong className={accent ? "accent" : ""}>
        {value}
      </strong>

      <p>{description}</p>
    </article>
  );
}