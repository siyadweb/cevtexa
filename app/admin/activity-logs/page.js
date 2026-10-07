"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

export default function ActivityLogsPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
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

      const [logsResponse, usersResponse] = await Promise.all([
        supabase
          .from("activity_logs")
          .select(
            `
              id,
              user_id,
              action,
              entity_type,
              entity_id,
              description,
              created_at
            `
          )
          .order("created_at", { ascending: false })
          .limit(500),

        supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .order("full_name", { ascending: true }),
      ]);

      if (logsResponse.error) throw logsResponse.error;

      setLogs(logsResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load activity logs.");
    } finally {
      setLoading(false);
    }
  }

  const userMap = useMemo(() => {
    const map = {};

    users.forEach((user) => {
      map[user.id] = user;
    });

    return map;
  }, [users]);

  const actionTypes = useMemo(() => {
    return [
      ...new Set(logs.map((log) => log.action).filter(Boolean)),
    ].sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const user = userMap[log.user_id];

      const userName = user?.full_name || "";
      const userEmail = user?.email || "";

      const matchesSearch =
        !query ||
        log.action?.toLowerCase().includes(query) ||
        log.entity_type?.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        userName.toLowerCase().includes(query) ||
        userEmail.toLowerCase().includes(query);

      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      const matchesUser =
        userFilter === "all" || log.user_id === userFilter;

      return matchesSearch && matchesAction && matchesUser;
    });
  }, [logs, userMap, search, actionFilter, userFilter]);

  function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function actionClass(action) {
    const value = (action || "").toLowerCase();

    if (
      value.includes("delete") ||
      value.includes("remove") ||
      value.includes("failed")
    ) {
      return "danger";
    }

    if (
      value.includes("create") ||
      value.includes("add") ||
      value.includes("publish")
    ) {
      return "success";
    }

    if (
      value.includes("update") ||
      value.includes("edit") ||
      value.includes("change")
    ) {
      return "info";
    }

    return "neutral";
  }

  function formatAction(action) {
    if (!action) return "Unknown";

    return action
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatEntity(entity) {
    if (!entity) return "—";

    return entity
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const stats = {
    total: logs.length,
    today: logs.filter((log) => {
      const date = new Date(log.created_at);
      const now = new Date();

      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length,
    users: new Set(logs.map((log) => log.user_id).filter(Boolean)).size,
    entities: new Set(
      logs.map((log) => log.entity_type).filter(Boolean)
    ).size,
  };

  return (
    <main className="activity-page">
      <style jsx>{`
        .activity-page {
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
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
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
          grid-template-columns: repeat(4, 1fr);
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
          display: grid;
          grid-template-columns: 1fr 190px 220px;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search,
        .select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.045);
          color: #eceff5;
          padding: 13px 15px;
          border-radius: 10px;
          outline: none;
        }

        .select {
          background: #0d1119;
        }

        .search:focus,
        .select:focus {
          border-color: rgba(41, 224, 255, 0.5);
        }

        .notice {
          padding: 13px 15px;
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 13px;
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
          min-width: 1050px;
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
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: 0;
        }

        .user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex: 0 0 34px;
          background: linear-gradient(135deg, #2f7fff, #29e0ff);
          color: white;
          font-size: 10px;
          font-weight: 900;
        }

        .user-name {
          font-weight: 750;
        }

        .user-email {
          color: #8b93a6;
          font-size: 11px;
          margin-top: 2px;
        }

        .action {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .action.success {
          color: #86efac;
          background: rgba(34, 197, 94, 0.1);
        }

        .action.danger {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.1);
        }

        .action.info {
          color: #8fc6ff;
          background: rgba(47, 127, 255, 0.1);
        }

        .action.neutral {
          color: #c7cedc;
          background: rgba(255, 255, 255, 0.07);
        }

        .entity {
          color: #b6f4ff;
          font-size: 12px;
        }

        .description {
          max-width: 420px;
          color: #c7cedc;
          line-height: 1.5;
        }

        .date {
          color: #8b93a6;
          white-space: nowrap;
          font-size: 12px;
        }

        .loading,
        .empty {
          text-align: center;
          padding: 65px 20px;
          color: #8b93a6;
        }

        .count {
          padding: 13px 18px;
          color: #8b93a6;
          font-size: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 900px) {
          .activity-page {
            padding: 20px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .toolbar {
            grid-template-columns: 1fr;
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
            <h1>Activity Logs</h1>
            <p className="subtitle">
              Track administrative actions and system activity.
            </p>
          </div>

          <button className="refresh" onClick={loadLogs}>
            ↻ Refresh
          </button>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">Total Activities</div>
            <div className="stat-value">{stats.total}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Today</div>
            <div className="stat-value">{stats.today}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{stats.users}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Entity Types</div>
            <div className="stat-value">{stats.entities}</div>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity, user, entity or description..."
          />

          <select
            className="select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>

            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {formatAction(action)}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">All Users</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email || "Unnamed User"}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="notice error">{error}</div>}

        <div className="table-card">
          {loading ? (
            <div className="loading">Loading activity logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 34, marginBottom: 10 }}>◷</div>
              No activity logs found.
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Description</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLogs.map((log) => {
                      const user = userMap[log.user_id];

                      return (
                        <tr key={log.id}>
                          <td>
                            <div className="user">
                              <div className="avatar">
                                {(user?.full_name ||
                                  user?.email ||
                                  "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <div className="user-name">
                                  {user?.full_name || "Unknown User"}
                                </div>

                                <div className="user-email">
                                  {user?.email || "User unavailable"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`action ${actionClass(
                                log.action
                              )}`}
                            >
                              {formatAction(log.action)}
                            </span>
                          </td>

                          <td>
                            <div className="entity">
                              {formatEntity(log.entity_type)}
                            </div>

                            {log.entity_id && (
                              <div
                                style={{
                                  color: "#626b7d",
                                  fontSize: 10,
                                  marginTop: 4,
                                }}
                              >
                                {log.entity_id.slice(0, 8)}...
                              </div>
                            )}
                          </td>

                          <td>
                            <div className="description">
                              {log.description || "No description"}
                            </div>
                          </td>

                          <td>
                            <div className="date">
                              {formatDate(log.created_at)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="count">
                Showing {filteredLogs.length} of {logs.length} activities
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}