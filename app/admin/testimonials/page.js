"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

const EMPTY_FORM = {
  client_name: "",
  company: "",
  role: "",
  content: "",
  avatar_url: "",
  rating: 5,
  featured: false,
  is_published: false,
};

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name) {
  if (!name) return "C";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadTestimonials() {
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/admin/login";
        return;
      }

      const { data, error: queryError } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (queryError) {
        throw queryError;
      }

      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to load testimonials."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  const stats = useMemo(() => {
    return {
      total: testimonials.length,
      published: testimonials.filter(
        (item) => item.is_published
      ).length,
      drafts: testimonials.filter(
        (item) => !item.is_published
      ).length,
      featured: testimonials.filter(
        (item) => item.featured
      ).length,
    };
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return testimonials.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.client_name,
          item.company,
          item.role,
          item.content,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      let matchesFilter = true;

      if (filter === "published") {
        matchesFilter = item.is_published === true;
      }

      if (filter === "draft") {
        matchesFilter = item.is_published === false;
      }

      if (filter === "featured") {
        matchesFilter = item.featured === true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [testimonials, search, filter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(testimonial) {
    setEditingId(testimonial.id);

    setForm({
      client_name: testimonial.client_name || "",
      company: testimonial.company || "",
      role: testimonial.role || "",
      content: testimonial.content || "",
      avatar_url: testimonial.avatar_url || "",
      rating: testimonial.rating || 5,
      featured: Boolean(testimonial.featured),
      is_published: Boolean(
        testimonial.is_published
      ),
    });

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveTestimonial(event) {
    event.preventDefault();

    if (!form.client_name.trim()) {
      setError("Client name is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Testimonial content is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabaseClient();

      const payload = {
        client_name: form.client_name.trim(),
        company: form.company.trim() || null,
        role: form.role.trim() || null,
        content: form.content.trim(),
        avatar_url: form.avatar_url.trim() || null,
        rating: Number(form.rating) || 5,
        featured: Boolean(form.featured),
        is_published: Boolean(form.is_published),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("testimonials")
            .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }

      await loadTestimonials();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to save testimonial."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTestimonial(id) {
    const confirmed = window.confirm(
      "Delete this testimonial permanently?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const supabase = getSupabaseClient();

      const { error: deleteError } =
        await supabase
          .from("testimonials")
          .delete()
          .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setTestimonials((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to delete testimonial."
      );
    }
  }

  async function togglePublished(testimonial) {
    try {
      const supabase = getSupabaseClient();

      const nextValue =
        !testimonial.is_published;

      const { error: updateError } =
        await supabase
          .from("testimonials")
          .update({
            is_published: nextValue,
          })
          .eq("id", testimonial.id);

      if (updateError) {
        throw updateError;
      }

      setTestimonials((current) =>
        current.map((item) =>
          item.id === testimonial.id
            ? {
                ...item,
                is_published: nextValue,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to update testimonial."
      );
    }
  }

  async function toggleFeatured(testimonial) {
    try {
      const supabase = getSupabaseClient();

      const nextValue = !testimonial.featured;

      const { error: updateError } =
        await supabase
          .from("testimonials")
          .update({
            featured: nextValue,
          })
          .eq("id", testimonial.id);

      if (updateError) {
        throw updateError;
      }

      setTestimonials((current) =>
        current.map((item) =>
          item.id === testimonial.id
            ? {
                ...item,
                featured: nextValue,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to update featured status."
      );
    }
  }

  return (
    <main className="testimonial-admin-page">
      <style jsx global>{`
        .testimonial-admin-page {
          min-height: 100vh;
          padding: 54px 52px 90px;
          background:
            radial-gradient(
              circle at 78% 5%,
              rgba(47, 127, 255, 0.1),
              transparent 30%
            ),
            #02070d;
          color: #eceff5;
        }

        .testimonial-admin-shell {
          max-width: 1500px;
          margin: 0 auto;
        }

        .testimonial-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 52px;
        }

        .testimonial-eyebrow {
          margin: 0 0 16px;
          color: #29e0ff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .testimonial-title {
          margin: 0;
          font-size: clamp(58px, 7vw, 104px);
          line-height: 0.86;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .testimonial-subtitle {
          max-width: 680px;
          margin: 24px 0 0;
          color: #8fa6c2;
          font-size: 18px;
          line-height: 1.65;
        }

        .testimonial-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .testimonial-button {
          min-height: 52px;
          padding: 0 20px;
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 14px;
          background: rgba(7, 20, 34, 0.9);
          color: #e9f2ff;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: 180ms ease;
        }

        .testimonial-button:hover {
          border-color: rgba(41,224,255,0.5);
          transform: translateY(-1px);
        }

        .testimonial-button.primary {
          border: 0;
          background: linear-gradient(
            135deg,
            #2f7fff,
            #29e0ff
          );
          color: #00101c;
          font-weight: 800;
        }

        .testimonial-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 18px;
        }

        .testimonial-stat {
          min-height: 150px;
          padding: 27px;
          border: 1px solid rgba(143,198,255,0.13);
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              rgba(8,25,42,0.9),
              rgba(3,12,21,0.94)
            );
        }

        .testimonial-stat-label {
          color: #6e96bd;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .testimonial-stat-value {
          margin-top: 24px;
          font-size: 46px;
          line-height: 1;
          font-weight: 700;
        }

        .testimonial-stat-value.accent {
          color: #29e0ff;
        }

        .testimonial-stat-description {
          margin-top: 9px;
          color: #5d7b9d;
          font-size: 13px;
        }

        .testimonial-panel {
          border: 1px solid rgba(143,198,255,0.13);
          border-radius: 24px;
          overflow: hidden;
          background: rgba(3,12,21,0.82);
        }

        .testimonial-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px 110px;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .testimonial-input,
        .testimonial-select {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          border: 1px solid rgba(143,198,255,0.15);
          border-radius: 12px;
          outline: none;
          background: #071624;
          color: #e9f2ff;
          font: inherit;
        }

        .testimonial-input::placeholder {
          color: #5f7793;
        }

        .testimonial-input:focus,
        .testimonial-select:focus {
          border-color: rgba(41,224,255,0.55);
        }

        .testimonial-refresh {
          height: 52px;
          border: 1px solid rgba(41,224,255,0.28);
          border-radius: 12px;
          background: rgba(8,31,43,0.8);
          color: #29e0ff;
          cursor: pointer;
        }

        .testimonial-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .testimonial-list-title {
          color: #dce8f7;
          font-size: 16px;
          font-weight: 700;
        }

        .testimonial-list-title span {
          margin-left: 10px;
          color: #60809f;
          font-weight: 400;
        }

        .testimonial-badges {
          display: flex;
          gap: 8px;
        }

        .testimonial-badge {
          padding: 8px 11px;
          border-radius: 10px;
          background: #071624;
          color: #6f9bc4;
          font-size: 12px;
        }

        .testimonial-table {
          width: 100%;
        }

        .testimonial-row {
          display: grid;
          grid-template-columns: minmax(260px, 1.7fr) 1.1fr 150px 120px 150px 120px;
          gap: 18px;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
        }

        .testimonial-row:last-child {
          border-bottom: 0;
        }

        .testimonial-row.header {
          color: #587999;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.015);
        }

        .testimonial-client {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .testimonial-avatar {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border: 1px solid rgba(41,224,255,0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #08233a;
          color: #8fdcff;
          font-size: 12px;
          font-weight: 800;
        }

        .testimonial-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .testimonial-client-name {
          overflow: hidden;
          color: #eaf2fb;
          font-size: 14px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .testimonial-client-role {
          margin-top: 4px;
          overflow: hidden;
          color: #607e9e;
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .testimonial-company {
          color: #9ab4cf;
          font-size: 13px;
        }

        .testimonial-content-preview {
          overflow: hidden;
          color: #7894b2;
          font-size: 12px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .testimonial-stars {
          color: #29e0ff;
          font-size: 13px;
          letter-spacing: 2px;
          white-space: nowrap;
        }

        .testimonial-status {
          display: inline-flex;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: #071624;
          font-size: 11px;
          color: #91abc5;
        }

        .testimonial-status.published {
          border-color: rgba(41,224,255,0.28);
          color: #29e0ff;
        }

        .testimonial-status.featured {
          margin-top: 6px;
          border-color: rgba(47,127,255,0.3);
          color: #8fc6ff;
        }

        .testimonial-row-actions {
          display: flex;
          gap: 7px;
        }

        .testimonial-small-button {
          min-height: 34px;
          padding: 0 10px;
          border: 1px solid rgba(143,198,255,0.14);
          border-radius: 9px;
          background: #071624;
          color: #9db6cf;
          cursor: pointer;
          font-size: 11px;
        }

        .testimonial-small-button:hover {
          border-color: rgba(41,224,255,0.4);
          color: #29e0ff;
        }

        .testimonial-small-button.danger:hover {
          border-color: rgba(255,90,110,0.45);
          color: #ff7888;
        }

        .testimonial-empty {
          padding: 90px 30px;
          text-align: center;
        }

        .testimonial-empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 18px;
          border: 2px solid #29e0ff;
          transform: rotate(45deg);
          opacity: 0.8;
        }

        .testimonial-empty h3 {
          margin: 0;
          font-size: 21px;
        }

        .testimonial-empty p {
          max-width: 500px;
          margin: 10px auto 24px;
          color: #63809f;
          line-height: 1.6;
        }

        .testimonial-error {
          margin-bottom: 18px;
          padding: 13px 16px;
          border: 1px solid rgba(255,85,105,0.25);
          border-radius: 12px;
          background: rgba(90,20,30,0.25);
          color: #ff8d9a;
          font-size: 13px;
        }

        .testimonial-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0,4,9,0.78);
          backdrop-filter: blur(14px);
        }

        .testimonial-modal {
          width: min(760px, 100%);
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          border: 1px solid rgba(143,198,255,0.18);
          border-radius: 24px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(47,127,255,0.1),
              transparent 35%
            ),
            #06111d;
          box-shadow: 0 30px 100px rgba(0,0,0,0.55);
        }

        .testimonial-modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 25px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .testimonial-modal-header h2 {
          margin: 0;
          font-size: 25px;
        }

        .testimonial-modal-header p {
          margin: 7px 0 0;
          color: #6784a4;
          font-size: 13px;
        }

        .testimonial-close {
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          background: #081724;
          color: #a8bfd5;
          cursor: pointer;
          font-size: 20px;
        }

        .testimonial-form {
          padding: 28px;
        }

        .testimonial-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .testimonial-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .testimonial-field.full {
          grid-column: 1 / -1;
        }

        .testimonial-field label {
          color: #6e96bd;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .testimonial-field input,
        .testimonial-field textarea,
        .testimonial-field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(143,198,255,0.15);
          border-radius: 11px;
          background: #071624;
          color: #edf5ff;
          outline: none;
          font: inherit;
        }

        .testimonial-field input,
        .testimonial-field select {
          height: 48px;
          padding: 0 14px;
        }

        .testimonial-field textarea {
          min-height: 145px;
          padding: 13px 14px;
          resize: vertical;
          line-height: 1.55;
        }

        .testimonial-field input:focus,
        .testimonial-field textarea:focus,
        .testimonial-field select:focus {
          border-color: rgba(41,224,255,0.5);
        }

        .testimonial-checks {
          display: flex;
          gap: 22px;
          padding-top: 5px;
        }

        .testimonial-check {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9ab1c8;
          font-size: 13px;
          cursor: pointer;
        }

        .testimonial-check input {
          width: 17px;
          height: 17px;
          accent-color: #29e0ff;
        }

        .testimonial-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        @media (max-width: 1150px) {
          .testimonial-admin-page {
            padding: 42px 26px 80px;
          }

          .testimonial-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .testimonial-row {
            min-width: 1150px;
          }

          .testimonial-table {
            overflow-x: auto;
          }

          .testimonial-toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .testimonial-admin-page {
            padding: 30px 16px 70px;
          }

          .testimonial-topbar {
            flex-direction: column;
          }

          .testimonial-title {
            font-size: 58px;
          }

          .testimonial-actions {
            width: 100%;
          }

          .testimonial-button {
            flex: 1;
          }

          .testimonial-stats {
            grid-template-columns: 1fr;
          }

          .testimonial-form-grid {
            grid-template-columns: 1fr;
          }

          .testimonial-field.full {
            grid-column: auto;
          }

          .testimonial-checks {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

      <div className="testimonial-admin-shell">
        <header className="testimonial-topbar">
          <div>
            <p className="testimonial-eyebrow">
              Content / Trust
            </p>

            <h1 className="testimonial-title">
              Testimonials
            </h1>

            <p className="testimonial-subtitle">
              Manage customer stories, social proof and
              client feedback displayed across the
              CEVTEXA website.
            </p>
          </div>

          <div className="testimonial-actions">
            <Link
              href="/admin"
              className="testimonial-button"
            >
              ← Dashboard
            </Link>

            <button
              type="button"
              className="testimonial-button primary"
              onClick={openCreate}
            >
              + New testimonial
            </button>
          </div>
        </header>

        {error && (
          <div className="testimonial-error">
            {error}
          </div>
        )}

        <section className="testimonial-stats">
          <div className="testimonial-stat">
            <div className="testimonial-stat-label">
              Total
            </div>

            <div className="testimonial-stat-value">
              {stats.total}
            </div>

            <div className="testimonial-stat-description">
              All testimonials
            </div>
          </div>

          <div className="testimonial-stat">
            <div className="testimonial-stat-label">
              Published
            </div>

            <div className="testimonial-stat-value accent">
              {stats.published}
            </div>

            <div className="testimonial-stat-description">
              Visible on website
            </div>
          </div>

          <div className="testimonial-stat">
            <div className="testimonial-stat-label">
              Drafts
            </div>

            <div className="testimonial-stat-value">
              {stats.drafts}
            </div>

            <div className="testimonial-stat-description">
              Not publicly visible
            </div>
          </div>

          <div className="testimonial-stat">
            <div className="testimonial-stat-label">
              Featured
            </div>

            <div className="testimonial-stat-value">
              {stats.featured}
            </div>

            <div className="testimonial-stat-description">
              Highlighted testimonials
            </div>
          </div>
        </section>

        <section className="testimonial-panel">
          <div className="testimonial-toolbar">
            <input
              className="testimonial-input"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search client, company, role, testimonial..."
            />

            <select
              className="testimonial-select"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >
              <option value="all">
                All testimonials
              </option>
              <option value="published">
                Published
              </option>
              <option value="draft">
                Drafts
              </option>
              <option value="featured">
                Featured
              </option>
            </select>

            <button
              type="button"
              className="testimonial-refresh"
              onClick={loadTestimonials}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="testimonial-list-header">
            <div className="testimonial-list-title">
              TESTIMONIALS
              <span>
                {filteredTestimonials.length} results
              </span>
            </div>

            <div className="testimonial-badges">
              <div className="testimonial-badge">
                Published {stats.published}
              </div>

              <div className="testimonial-badge">
                Drafts {stats.drafts}
              </div>

              <div className="testimonial-badge">
                Featured {stats.featured}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="testimonial-empty">
              <h3>Loading testimonials...</h3>
              <p>
                Connecting to the CEVTEXA content
                system.
              </p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="testimonial-empty">
              <div className="testimonial-empty-icon" />

              <h3>
                {testimonials.length === 0
                  ? "No testimonials yet"
                  : "No testimonials found"}
              </h3>

              <p>
                {testimonials.length === 0
                  ? "Create your first testimonial to start building the CEVTEXA trust library."
                  : "Try changing your search or filter."}
              </p>

              {testimonials.length === 0 && (
                <button
                  type="button"
                  className="testimonial-button primary"
                  onClick={openCreate}
                >
                  + Create testimonial
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div className="testimonial-table">
                <div className="testimonial-row header">
                  <div>CLIENT</div>
                  <div>COMPANY</div>
                  <div>RATING</div>
                  <div>STATUS</div>
                  <div>CREATED</div>
                  <div>ACTIONS</div>
                </div>

                {filteredTestimonials.map(
                  (testimonial) => (
                    <div
                      className="testimonial-row"
                      key={testimonial.id}
                    >
                      <div className="testimonial-client">
                        <div className="testimonial-avatar">
                          {testimonial.avatar_url ? (
                            <img
                              src={
                                testimonial.avatar_url
                              }
                              alt=""
                            />
                          ) : (
                            initials(
                              testimonial.client_name
                            )
                          )}
                        </div>

                        <div>
                          <div className="testimonial-client-name">
                            {testimonial.client_name}
                          </div>

                          <div className="testimonial-client-role">
                            {testimonial.role ||
                              "Client"}
                          </div>

                          <div className="testimonial-content-preview">
                            {testimonial.content}
                          </div>
                        </div>
                      </div>

                      <div className="testimonial-company">
                        {testimonial.company || "—"}
                      </div>

                      <div className="testimonial-stars">
                        {"★".repeat(
                          Math.max(
                            0,
                            Math.min(
                              5,
                              testimonial.rating || 0
                            )
                          )
                        )}
                      </div>

                      <div>
                        <button
                          type="button"
                          className={`testimonial-status ${
                            testimonial.is_published
                              ? "published"
                              : ""
                          }`}
                          onClick={() =>
                            togglePublished(
                              testimonial
                            )
                          }
                        >
                          {testimonial.is_published
                            ? "Published"
                            : "Draft"}
                        </button>

                        {testimonial.featured && (
                          <div className="testimonial-status featured">
                            Featured
                          </div>
                        )}
                      </div>

                      <div className="testimonial-company">
                        {formatDate(
                          testimonial.created_at
                        )}
                      </div>

                      <div className="testimonial-row-actions">
                        <button
                          type="button"
                          className="testimonial-small-button"
                          onClick={() =>
                            openEdit(testimonial)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="testimonial-small-button"
                          onClick={() =>
                            toggleFeatured(
                              testimonial
                            )
                          }
                        >
                          {testimonial.featured
                            ? "Unfeature"
                            : "Feature"}
                        </button>

                        <button
                          type="button"
                          className="testimonial-small-button danger"
                          onClick={() =>
                            deleteTestimonial(
                              testimonial.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="testimonial-overlay">
          <div className="testimonial-modal">
            <div className="testimonial-modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit testimonial"
                    : "New testimonial"}
                </h2>

                <p>
                  Add customer feedback to the CEVTEXA
                  trust library.
                </p>
              </div>

              <button
                type="button"
                className="testimonial-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              className="testimonial-form"
              onSubmit={saveTestimonial}
            >
              <div className="testimonial-form-grid">
                <div className="testimonial-field">
                  <label>Client name *</label>

                  <input
                    value={form.client_name}
                    onChange={(event) =>
                      updateField(
                        "client_name",
                        event.target.value
                      )
                    }
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div className="testimonial-field">
                  <label>Company</label>

                  <input
                    value={form.company}
                    onChange={(event) =>
                      updateField(
                        "company",
                        event.target.value
                      )
                    }
                    placeholder="Acme Technologies"
                  />
                </div>

                <div className="testimonial-field">
                  <label>Role / designation</label>

                  <input
                    value={form.role}
                    onChange={(event) =>
                      updateField(
                        "role",
                        event.target.value
                      )
                    }
                    placeholder="Founder & CEO"
                  />
                </div>

                <div className="testimonial-field">
                  <label>Rating</label>

                  <select
                    value={form.rating}
                    onChange={(event) =>
                      updateField(
                        "rating",
                        Number(event.target.value)
                      )
                    }
                  >
                    <option value={5}>
                      5 — Excellent
                    </option>
                    <option value={4}>
                      4 — Very good
                    </option>
                    <option value={3}>
                      3 — Good
                    </option>
                    <option value={2}>
                      2 — Fair
                    </option>
                    <option value={1}>
                      1 — Poor
                    </option>
                  </select>
                </div>

                <div className="testimonial-field full">
                  <label>Testimonial *</label>

                  <textarea
                    value={form.content}
                    onChange={(event) =>
                      updateField(
                        "content",
                        event.target.value
                      )
                    }
                    placeholder="Working with CEVTEXA transformed the way our business operates..."
                    required
                  />
                </div>

                <div className="testimonial-field full">
                  <label>Avatar image URL</label>

                  <input
                    value={form.avatar_url}
                    onChange={(event) =>
                      updateField(
                        "avatar_url",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="testimonial-field full">
                  <div className="testimonial-checks">
                    <label className="testimonial-check">
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

                      Publish on website
                    </label>

                    <label className="testimonial-check">
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

                      Featured testimonial
                    </label>
                  </div>
                </div>
              </div>

              <div className="testimonial-form-actions">
                <button
                  type="button"
                  className="testimonial-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="testimonial-button primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save changes"
                    : "Create testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}