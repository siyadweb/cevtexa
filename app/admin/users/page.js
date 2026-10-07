"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const ROLES = ["owner", "admin", "editor", "staff"];

const ROLE_LABELS = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  staff: "Staff",
};

const ROLE_DESCRIPTIONS = {
  owner: "Full system access",
  admin: "Administrative access",
  editor: "Content management",
  staff: "Basic operational access",
};

export default function AdminUsersPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/admin/login");
        return;
      }

      setCurrentUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, avatar_url, role, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  function openRoleEditor(user) {
    setSelectedUser(user);
    setSelectedRole(user.role || "staff");
    setMessage("");
    setError("");
  }

  function closeRoleEditor() {
    if (saving) return;

    setSelectedUser(null);
    setSelectedRole("");
  }

  async function updateRole() {
    if (!selectedUser) return;

    if (!ROLES.includes(selectedRole)) {
      setError("Invalid role selected.");
      return;
    }

    if (selectedUser.id === currentUser?.id && selectedRole !== "owner") {
      setError("You cannot remove your own owner access.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: selectedRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsers((previous) =>
        previous.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                role: selectedRole,
                updated_at: new Date().toISOString(),
              }
            : user
        )
      );

      setSelectedUser(null);
      setSelectedRole("");
      setMessage("User role updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update user role.");
    } finally {
      setSaving(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query);

    const matchesRole =
      roleFilter === "all" || (user.role || "staff") === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    owners: users.filter((u) => u.role === "owner").length,
    admins: users.filter((u) => u.role === "admin").length,
    editors: users.filter((u) => u.role === "editor").length,
    staff: users.filter((u) => u.role === "staff").length,
  };

  function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function initials(user) {
    const name = user.full_name || user.email || "U";

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return (
    <main className="users-page">
      <style jsx>{`
        .users-page {
          min-height: 100vh;
          padding: 32px;
          color: #eceff5;
          background:
            radial-gradient(
              circle at 85% 0%,
              rgba(47, 127, 255, 0.12),
              transparent 30%
            ),
            #070a10;
        }

        .container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #29e0ff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        h1 {
          margin: 0;
          font-size: clamp(30px, 4vw, 44px);
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 9px 0 0;
          color: #8b93a6;
          font-size: 14px;
        }

        .refresh {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.045);
          color: #eceff5;
          padding: 11px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .refresh:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .stat {
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
        }

        .stat-label {
          color: #8b93a6;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
        }

        .toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search {
          flex: 1;
          min-width: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.045);
          color: #eceff5;
          padding: 13px 15px;
          border-radius: 10px;
          outline: none;
        }

        .search:focus,
        .select:focus {
          border-color: rgba(41, 224, 255, 0.5);
        }

        .select {
          min-width: 160px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0d1119;
          color: #eceff5;
          padding: 13px 15px;
          border-radius: 10px;
          outline: none;
        }

        .notice {
          padding: 13px 15px;
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .success {
          background: rgba(35, 197, 94, 0.1);
          border: 1px solid rgba(35, 197, 94, 0.2);
          color: #86efac;
        }

        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .table-card {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.025);
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 15px 18px;
          color: #8b93a6;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        td {
          padding: 17px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
          font-size: 13px;
        }

        tr:last-child td {
          border-bottom: 0;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: linear-gradient(135deg, #2f7fff, #29e0ff);
          color: #fff;
          font-size: 12px;
          font-weight: 900;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .name {
          font-weight: 750;
        }

        .email {
          color: #8b93a6;
          font-size: 12px;
          margin-top: 3px;
        }

        .role {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }

        .role-owner {
          background: rgba(168, 85, 247, 0.13);
          color: #d8b4fe;
        }

        .role-admin {
          background: rgba(47, 127, 255, 0.13);
          color: #8fc6ff;
        }

        .role-editor {
          background: rgba(41, 224, 255, 0.1);
          color: #8ff0ff;
        }

        .role-staff {
          background: rgba(255, 255, 255, 0.08);
          color: #c7cedc;
        }

        .edit-btn {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.045);
          color: #eceff5;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .edit-btn:hover {
          border-color: rgba(41, 224, 255, 0.35);
        }

        .empty {
          text-align: center;
          padding: 60px 20px;
          color: #8b93a6;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #8b93a6;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(10px);
        }

        .modal {
          width: min(480px, 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: #0c1018;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.55);
          padding: 24px;
        }

        .modal h2 {
          margin: 0;
          font-size: 22px;
        }

        .modal-subtitle {
          margin: 7px 0 22px;
          color: #8b93a6;
          font-size: 13px;
        }

        .selected-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          margin-bottom: 18px;
        }

        .role-option {
          width: 100%;
          text-align: left;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.025);
          color: #eceff5;
          border-radius: 12px;
          padding: 13px;
          margin-bottom: 9px;
          cursor: pointer;
        }

        .role-option.active {
          border-color: rgba(47, 127, 255, 0.6);
          background: rgba(47, 127, 255, 0.09);
        }

        .role-option strong {
          display: block;
          margin-bottom: 4px;
        }

        .role-option span {
          color: #8b93a6;
          font-size: 12px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .cancel,
        .save {
          padding: 11px 16px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 750;
        }

        .cancel {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: #c7cedc;
        }

        .save {
          border: 0;
          background: #2f7fff;
          color: white;
        }

        .save:disabled,
        .cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .users-page {
            padding: 20px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .toolbar {
            flex-direction: column;
          }

          .select {
            width: 100%;
          }
        }

        @media (max-width: 520px) {
          .topbar {
            flex-direction: column;
          }

          .refresh {
            width: 100%;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="container">
        <div className="topbar">
          <div>
            <div className="eyebrow">Administration</div>
            <h1>Users & Roles</h1>
            <p className="subtitle">
              Manage administrator profiles and access roles.
            </p>
          </div>

          <button className="refresh" onClick={loadUsers}>
            ↻ Refresh
          </button>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.total}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Owners</div>
            <div className="stat-value">{stats.owners}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Admins</div>
            <div className="stat-value">{stats.admins}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Editors</div>
            <div className="stat-value">{stats.editors}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Staff</div>
            <div className="stat-value">{stats.staff}</div>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
          />

          <select
            className="select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}

        <div className="table-card">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 32, marginBottom: 10 }}>◎</div>
              No users found.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const role = user.role || "staff";

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="avatar">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt=""
                                />
                              ) : (
                                initials(user)
                              )}
                            </div>

                            <div>
                              <div className="name">
                                {user.full_name || "Unnamed User"}
                              </div>
                              <div className="email">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>{user.phone || "—"}</td>

                        <td>
                          <span className={`role role-${role}`}>
                            {ROLE_LABELS[role] || "Staff"}
                          </span>
                        </td>

                        <td>{formatDate(user.created_at)}</td>

                        <td>{formatDate(user.updated_at)}</td>

                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => openRoleEditor(user)}
                          >
                            Manage Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="modal-backdrop" onMouseDown={closeRoleEditor}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Manage Role</h2>

            <p className="modal-subtitle">
              Choose the access level for this user.
            </p>

            <div className="selected-user">
              <div className="avatar">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" />
                ) : (
                  initials(selectedUser)
                )}
              </div>

              <div>
                <div className="name">
                  {selectedUser.full_name || "Unnamed User"}
                </div>
                <div className="email">
                  {selectedUser.email || "No email"}
                </div>
              </div>
            </div>

            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                className={`role-option ${
                  selectedRole === role ? "active" : ""
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <strong>{ROLE_LABELS[role]}</strong>
                <span>{ROLE_DESCRIPTIONS[role]}</span>
              </button>
            ))}

            {error && <div className="notice error">{error}</div>}

            <div className="modal-actions">
              <button
                className="cancel"
                onClick={closeRoleEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="save"
                onClick={updateRole}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}