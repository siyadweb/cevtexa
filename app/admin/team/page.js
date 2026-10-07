"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

const EMPTY_FORM = {
  name: "",
  role: "",
  bio: "",
  photo_url: "",
  linkedin_url: "",
  sort_order: 0,
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

export default function TeamAdminPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadMembers() {
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
        .from("team_members")
        .select("*")
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

      if (queryError) {
        throw queryError;
      }

      setMembers(data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load team members."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const stats = useMemo(() => {
    return {
      total: members.length,
      published: members.filter(
        (item) => item.is_published
      ).length,
      drafts: members.filter(
        (item) => !item.is_published
      ).length,
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        [
          member.name,
          member.role,
          member.bio,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      let matchesFilter = true;

      if (filter === "published") {
        matchesFilter =
          member.is_published === true;
      }

      if (filter === "draft") {
        matchesFilter =
          member.is_published === false;
      }

      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(member) {
    setEditingId(member.id);

    setForm({
      name: member.name || "",
      role: member.role || "",
      bio: member.bio || "",
      photo_url: member.photo_url || "",
      linkedin_url: member.linkedin_url || "",
      sort_order: member.sort_order ?? 0,
      is_published: Boolean(
        member.is_published
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

  async function saveMember(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Team member name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabaseClient();

      const payload = {
        name: form.name.trim(),
        role: form.role.trim() || null,
        bio: form.bio.trim() || null,
        photo_url: form.photo_url.trim() || null,
        linkedin_url:
          form.linkedin_url.trim() || null,
        sort_order:
          Number(form.sort_order) || 0,
        is_published: Boolean(
          form.is_published
        ),
      };

      if (editingId) {
        const { error: updateError } =
          await supabase
            .from("team_members")
            .update(payload)
            .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("team_members")
            .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }

      await loadMembers();
      closeModal();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save team member."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember(id) {
    const confirmed = window.confirm(
      "Delete this team member permanently?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const supabase = getSupabaseClient();

      const { error: deleteError } =
        await supabase
          .from("team_members")
          .delete()
          .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setMembers((current) =>
        current.filter(
          (member) => member.id !== id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to delete team member."
      );
    }
  }

  async function togglePublished(member) {
    try {
      const supabase = getSupabaseClient();

      const nextValue =
        !member.is_published;

      const { error: updateError } =
        await supabase
          .from("team_members")
          .update({
            is_published: nextValue,
          })
          .eq("id", member.id);

      if (updateError) {
        throw updateError;
      }

      setMembers((current) =>
        current.map((item) =>
          item.id === member.id
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
          "Unable to update status."
      );
    }
  }

  return (
    <main className="team-admin-page">
      <style jsx global>{`
        .team-admin-page {
          min-height: 100vh;
          padding: 54px 52px 90px;
          background:
            radial-gradient(
              circle at 80% 5%,
              rgba(47, 127, 255, 0.1),
              transparent 30%
            ),
            #02070d;
          color: #eceff5;
        }

        .team-admin-shell {
          max-width: 1500px;
          margin: 0 auto;
        }

        .team-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 52px;
        }

        .team-eyebrow {
          margin: 0 0 16px;
          color: #29e0ff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .team-title {
          margin: 0;
          font-size: clamp(60px, 7vw, 105px);
          line-height: 0.86;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .team-subtitle {
          max-width: 700px;
          margin: 24px 0 0;
          color: #8fa6c2;
          font-size: 18px;
          line-height: 1.65;
        }

        .team-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .team-button {
          min-height: 52px;
          padding: 0 20px;
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 14px;
          background: rgba(7,20,34,0.9);
          color: #e9f2ff;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: 180ms ease;
        }

        .team-button:hover {
          border-color: rgba(41,224,255,0.5);
          transform: translateY(-1px);
        }

        .team-button.primary {
          border: 0;
          background: linear-gradient(
            135deg,
            #2f7fff,
            #29e0ff
          );
          color: #00101c;
          font-weight: 800;
        }

        .team-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 18px;
        }

        .team-stat {
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

        .team-stat-label {
          color: #6e96bd;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .team-stat-value {
          margin-top: 24px;
          font-size: 46px;
          line-height: 1;
          font-weight: 700;
        }

        .team-stat-value.accent {
          color: #29e0ff;
        }

        .team-stat-description {
          margin-top: 9px;
          color: #5d7b9d;
          font-size: 13px;
        }

        .team-panel {
          border: 1px solid rgba(143,198,255,0.13);
          border-radius: 24px;
          overflow: hidden;
          background: rgba(3,12,21,0.82);
        }

        .team-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px 110px;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .team-input,
        .team-select {
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

        .team-input::placeholder {
          color: #5f7793;
        }

        .team-input:focus,
        .team-select:focus {
          border-color: rgba(41,224,255,0.55);
        }

        .team-refresh {
          height: 52px;
          border: 1px solid rgba(41,224,255,0.28);
          border-radius: 12px;
          background: rgba(8,31,43,0.8);
          color: #29e0ff;
          cursor: pointer;
        }

        .team-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .team-list-title {
          color: #dce8f7;
          font-size: 16px;
          font-weight: 700;
        }

        .team-list-title span {
          margin-left: 10px;
          color: #60809f;
          font-weight: 400;
        }

        .team-badges {
          display: flex;
          gap: 8px;
        }

        .team-badge {
          padding: 8px 11px;
          border-radius: 10px;
          background: #071624;
          color: #6f9bc4;
          font-size: 12px;
        }

        .team-row {
          display: grid;
          grid-template-columns:
            minmax(280px, 1.6fr)
            minmax(180px, 1fr)
            minmax(250px, 1.5fr)
            100px
            130px
            220px;
          gap: 18px;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
        }

        .team-row:last-child {
          border-bottom: 0;
        }

        .team-row.header {
          color: #587999;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.015);
        }

        .team-person {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .team-avatar {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid rgba(41,224,255,0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #08233a;
          color: #8fdcff;
          font-size: 12px;
          font-weight: 800;
        }

        .team-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .team-person-name {
          overflow: hidden;
          color: #eaf2fb;
          font-size: 14px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .team-person-role {
          margin-top: 4px;
          overflow: hidden;
          color: #607e9e;
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .team-bio {
          overflow: hidden;
          color: #7894b2;
          font-size: 12px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .team-order {
          color: #91abc5;
          font-size: 13px;
        }

        .team-status {
          display: inline-flex;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: #071624;
          color: #91abc5;
          font-size: 11px;
          cursor: pointer;
        }

        .team-status.published {
          border-color: rgba(41,224,255,0.28);
          color: #29e0ff;
        }

        .team-date {
          color: #7894b2;
          font-size: 12px;
        }

        .team-row-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .team-small-button {
          min-height: 34px;
          padding: 0 10px;
          border: 1px solid rgba(143,198,255,0.14);
          border-radius: 9px;
          background: #071624;
          color: #9db6cf;
          cursor: pointer;
          font-size: 11px;
        }

        .team-small-button:hover {
          border-color: rgba(41,224,255,0.4);
          color: #29e0ff;
        }

        .team-small-button.danger:hover {
          border-color: rgba(255,90,110,0.45);
          color: #ff7888;
        }

        .team-empty {
          padding: 90px 30px;
          text-align: center;
        }

        .team-empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 18px;
          border: 2px solid #29e0ff;
          transform: rotate(45deg);
          opacity: 0.8;
        }

        .team-empty h3 {
          margin: 0;
          font-size: 21px;
        }

        .team-empty p {
          max-width: 520px;
          margin: 10px auto 24px;
          color: #63809f;
          line-height: 1.6;
        }

        .team-error {
          margin-bottom: 18px;
          padding: 13px 16px;
          border: 1px solid rgba(255,85,105,0.25);
          border-radius: 12px;
          background: rgba(90,20,30,0.25);
          color: #ff8d9a;
          font-size: 13px;
        }

        .team-overlay {
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

        .team-modal {
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

        .team-modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 25px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .team-modal-header h2 {
          margin: 0;
          font-size: 25px;
        }

        .team-modal-header p {
          margin: 7px 0 0;
          color: #6784a4;
          font-size: 13px;
        }

        .team-close {
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          background: #081724;
          color: #a8bfd5;
          cursor: pointer;
          font-size: 20px;
        }

        .team-form {
          padding: 28px;
        }

        .team-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .team-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .team-field.full {
          grid-column: 1 / -1;
        }

        .team-field label {
          color: #6e96bd;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .team-field input,
        .team-field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(143,198,255,0.15);
          border-radius: 11px;
          background: #071624;
          color: #edf5ff;
          outline: none;
          font: inherit;
        }

        .team-field input {
          height: 48px;
          padding: 0 14px;
        }

        .team-field textarea {
          min-height: 145px;
          padding: 13px 14px;
          resize: vertical;
          line-height: 1.55;
        }

        .team-field input:focus,
        .team-field textarea:focus {
          border-color: rgba(41,224,255,0.5);
        }

        .team-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .team-check {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #9ab1c8;
          font-size: 13px;
          cursor: pointer;
        }

        .team-check input {
          width: 17px;
          height: 17px;
          accent-color: #29e0ff;
        }

        @media (max-width: 1150px) {
          .team-admin-page {
            padding: 42px 26px 80px;
          }

          .team-stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .team-toolbar {
            grid-template-columns: 1fr;
          }

          .team-table-wrap {
            overflow-x: auto;
          }

          .team-row {
            min-width: 1200px;
          }
        }

        @media (max-width: 720px) {
          .team-admin-page {
            padding: 30px 16px 70px;
          }

          .team-topbar {
            flex-direction: column;
          }

          .team-title {
            font-size: 58px;
          }

          .team-actions {
            width: 100%;
          }

          .team-button {
            flex: 1;
          }

          .team-stats {
            grid-template-columns: 1fr;
          }

          .team-form-grid {
            grid-template-columns: 1fr;
          }

          .team-field.full {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="team-admin-shell">
        <header className="team-topbar">
          <div>
            <p className="team-eyebrow">
              People / Studio
            </p>

            <h1 className="team-title">
              Team
            </h1>

            <p className="team-subtitle">
              Manage the people behind CEVTEXA and
              control who appears on the public website.
            </p>
          </div>

          <div className="team-actions">
            <Link
              href="/admin"
              className="team-button"
            >
              ← Dashboard
            </Link>

            <button
              type="button"
              className="team-button primary"
              onClick={openCreate}
            >
              + New team member
            </button>
          </div>
        </header>

        {error && (
          <div className="team-error">
            {error}
          </div>
        )}

        <section className="team-stats">
          <div className="team-stat">
            <div className="team-stat-label">
              Total
            </div>

            <div className="team-stat-value">
              {stats.total}
            </div>

            <div className="team-stat-description">
              All team members
            </div>
          </div>

          <div className="team-stat">
            <div className="team-stat-label">
              Published
            </div>

            <div className="team-stat-value accent">
              {stats.published}
            </div>

            <div className="team-stat-description">
              Visible on website
            </div>
          </div>

          <div className="team-stat">
            <div className="team-stat-label">
              Drafts
            </div>

            <div className="team-stat-value">
              {stats.drafts}
            </div>

            <div className="team-stat-description">
              Hidden team profiles
            </div>
          </div>
        </section>

        <section className="team-panel">
          <div className="team-toolbar">
            <input
              className="team-input"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, role, bio..."
            />

            <select
              className="team-select"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >
              <option value="all">
                All team members
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
              className="team-refresh"
              onClick={loadMembers}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="team-list-header">
            <div className="team-list-title">
              TEAM
              <span>
                {filteredMembers.length} members
              </span>
            </div>

            <div className="team-badges">
              <div className="team-badge">
                Published {stats.published}
              </div>

              <div className="team-badge">
                Drafts {stats.drafts}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="team-empty">
              <h3>
                Loading team...
              </h3>

              <p>
                Connecting to the CEVTEXA content
                system.
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="team-empty">
              <div className="team-empty-icon" />

              <h3>
                {members.length === 0
                  ? "No team members yet"
                  : "No team members found"}
              </h3>

              <p>
                {members.length === 0
                  ? "Create your first team profile to start building the CEVTEXA team section."
                  : "Try changing your search or filter."}
              </p>

              {members.length === 0 && (
                <button
                  type="button"
                  className="team-button primary"
                  onClick={openCreate}
                >
                  + Create team member
                </button>
              )}
            </div>
          ) : (
            <div className="team-table-wrap">
              <div>
                <div className="team-row header">
                  <div>PERSON</div>
                  <div>ROLE</div>
                  <div>BIO</div>
                  <div>ORDER</div>
                  <div>STATUS</div>
                  <div>ACTIONS</div>
                </div>

                {filteredMembers.map((member) => (
                  <div
                    className="team-row"
                    key={member.id}
                  >
                    <div className="team-person">
                      <div className="team-avatar">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt=""
                          />
                        ) : (
                          initials(member.name)
                        )}
                      </div>

                      <div>
                        <div className="team-person-name">
                          {member.name}
                        </div>

                        <div className="team-person-role">
                          {member.linkedin_url
                            ? "LinkedIn profile available"
                            : "No LinkedIn profile"}
                        </div>
                      </div>
                    </div>

                    <div className="team-person-role">
                      {member.role || "—"}
                    </div>

                    <div className="team-bio">
                      {member.bio ||
                        "No biography added."}
                    </div>

                    <div className="team-order">
                      #{member.sort_order ?? 0}
                    </div>

                    <div>
                      <button
                        type="button"
                        className={`team-status ${
                          member.is_published
                            ? "published"
                            : ""
                        }`}
                        onClick={() =>
                          togglePublished(member)
                        }
                      >
                        {member.is_published
                          ? "Published"
                          : "Draft"}
                      </button>

                      <div className="team-date">
                        {formatDate(
                          member.created_at
                        )}
                      </div>
                    </div>

                    <div className="team-row-actions">
                      <button
                        type="button"
                        className="team-small-button"
                        onClick={() =>
                          openEdit(member)
                        }
                      >
                        Edit
                      </button>

                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="team-small-button"
                        >
                          LinkedIn
                        </a>
                      )}

                      <button
                        type="button"
                        className="team-small-button danger"
                        onClick={() =>
                          deleteMember(member.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="team-overlay">
          <div className="team-modal">
            <div className="team-modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit team member"
                    : "New team member"}
                </h2>

                <p>
                  Add a person to the CEVTEXA team
                  directory.
                </p>
              </div>

              <button
                type="button"
                className="team-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              className="team-form"
              onSubmit={saveMember}
            >
              <div className="team-form-grid">
                <div className="team-field">
                  <label>
                    Name *
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Muhammed Ziyad"
                    required
                  />
                </div>

                <div className="team-field">
                  <label>
                    Role
                  </label>

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

                <div className="team-field full">
                  <label>
                    Biography
                  </label>

                  <textarea
                    value={form.bio}
                    onChange={(event) =>
                      updateField(
                        "bio",
                        event.target.value
                      )
                    }
                    placeholder="Short professional biography..."
                  />
                </div>

                <div className="team-field">
                  <label>
                    Photo URL
                  </label>

                  <input
                    value={form.photo_url}
                    onChange={(event) =>
                      updateField(
                        "photo_url",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="team-field">
                  <label>
                    LinkedIn URL
                  </label>

                  <input
                    value={form.linkedin_url}
                    onChange={(event) =>
                      updateField(
                        "linkedin_url",
                        event.target.value
                      )
                    }
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="team-field">
                  <label>
                    Display order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={(event) =>
                      updateField(
                        "sort_order",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="team-field">
                  <label>
                    Visibility
                  </label>

                  <label className="team-check">
                    <input
                      type="checkbox"
                      checked={
                        form.is_published
                      }
                      onChange={(event) =>
                        updateField(
                          "is_published",
                          event.target.checked
                        )
                      }
                    />

                    Publish on website
                  </label>
                </div>
              </div>

              <div className="team-form-actions">
                <button
                  type="button"
                  className="team-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="team-button primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save changes"
                    : "Create team member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}