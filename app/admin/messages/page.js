"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  return (
    STATUS_OPTIONS.find(
      (item) => item.value === status
    )?.label || status || "New"
  );
}

function initials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getStatusStyle(status) {
  const styles = {
    new: {
      color: "#29e0ff",
      background: "rgba(41,224,255,.08)",
      borderColor: "rgba(41,224,255,.25)",
    },
    read: {
      color: "#8fc6ff",
      background: "rgba(47,127,255,.08)",
      borderColor: "rgba(47,127,255,.22)",
    },
    replied: {
      color: "#b6f4ff",
      background: "rgba(182,244,255,.08)",
      borderColor: "rgba(182,244,255,.22)",
    },
    archived: {
      color: "#8b93a6",
      background: "rgba(139,147,166,.06)",
      borderColor: "rgba(139,147,166,.18)",
    },
  };

  return styles[status] || styles.new;
}

export default function MessagesPage() {
  const [supabase, setSupabase] = useState(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const client = getSupabaseClient();

        if (!mounted) return;

        setSupabase(client);

        const {
          data: { user: currentUser },
          error: authError,
        } = await client.auth.getUser();

        if (authError || !currentUser) {
          window.location.href = "/admin/login";
          return;
        }

        const { data: currentProfile, error: profileError } =
          await client
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();

        if (profileError) {
          throw profileError;
        }

        if (
          !currentProfile ||
          !["owner", "admin"].includes(
            currentProfile.role
          )
        ) {
          await client.auth.signOut();
          window.location.href = "/admin/login";
          return;
        }

        if (!mounted) return;

        setUser(currentUser);
        setProfile(currentProfile);

        await loadMessages(client);
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load messages."
          );
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  async function loadMessages(client = supabase) {
    if (!client) return;

    try {
      setLoading(true);
      setError("");

      const { data, error: messagesError } =
        await client
          .from("contact_messages")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (messagesError) {
        throw messagesError;
      }

      setMessages(data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openMessage(message) {
    setSelectedMessage(message);

    if (
      message.status === "new" &&
      supabase
    ) {
      await updateMessageStatus(
        message,
        "read",
        false
      );
    }
  }

  async function updateMessageStatus(
    message,
    status,
    closeAfter = false
  ) {
    if (!supabase || !message) return;

    try {
      setUpdating(true);
      setError("");

      const { error: updateError } =
        await supabase
          .from("contact_messages")
          .update({
            status,
          })
          .eq("id", message.id);

      if (updateError) {
        throw updateError;
      }

      const updatedMessage = {
        ...message,
        status,
      };

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? updatedMessage
            : item
        )
      );

      setSelectedMessage((current) =>
        current?.id === message.id
          ? updatedMessage
          : current
      );

      if (closeAfter) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to update message."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function deleteMessage(message) {
    if (!supabase || !message) return;

    const confirmed = window.confirm(
      `Delete the message from "${message.name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setUpdating(true);

      const { error: deleteError } =
        await supabase
          .from("contact_messages")
          .delete()
          .eq("id", message.id);

      if (deleteError) {
        throw deleteError;
      }

      setMessages((current) =>
        current.filter(
          (item) => item.id !== message.id
        )
      );

      setSelectedMessage(null);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to delete message."
      );
    } finally {
      setUpdating(false);
    }
  }

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const searchable = [
        message.name,
        message.email,
        message.phone,
        message.subject,
        message.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesStatus =
        !statusFilter ||
        message.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [messages, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: messages.length,
      new: messages.filter(
        (message) =>
          message.status === "new"
      ).length,
      read: messages.filter(
        (message) =>
          message.status === "read"
      ).length,
      replied: messages.filter(
        (message) =>
          message.status === "replied"
      ).length,
      archived: messages.filter(
        (message) =>
          message.status === "archived"
      ).length,
    }),
    [messages]
  );

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>
          Loading messages...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <a href="/admin" style={styles.brand}>
          <img
            src="/logo.webp"
            alt="CEVTEXA"
            style={styles.brandLogo}
          />

          <div>
            <strong style={styles.brandName}>
              CEVTEXA
            </strong>

            <span style={styles.brandSub}>
              CONTROL CENTER
            </span>
          </div>
        </a>

        <div style={styles.sidebarLabel}>
          WORKSPACE
        </div>

        <a
          href="/admin"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Overview
        </a>

        <a
          href="/admin/leads"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Leads / CRM
        </a>

        <div
          style={{
            ...styles.sidebarLink,
            ...styles.sidebarActive,
          }}
        >
          <span style={styles.sidebarDot} />
          Messages
        </div>

        <a
          href="/admin/projects"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Projects
        </a>

        <a
          href="/admin/case-studies"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Case Studies
        </a>

        <a
          href="/admin/services"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Services
        </a>

        <a
          href="/admin/blog"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Blog / Insights
        </a>

        <a
          href="/admin/testimonials"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Testimonials
        </a>

        <a
          href="/admin/team"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Team
        </a>

        <a
          href="/admin/careers"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Careers
        </a>

        <a
          href="/admin/media"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Media
        </a>

        <a
          href="/admin/pages"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Pages / SEO
        </a>

        <a
          href="/admin/settings"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Settings
        </a>

        <div style={styles.sidebarBottom}>
          <div style={styles.userEmail}>
            {profile?.email ||
              user?.email ||
              "Admin"}
          </div>

          <button
            type="button"
            onClick={async () => {
              await supabase?.auth.signOut();
              window.location.href =
                "/admin/login";
            }}
            style={styles.signOut}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              INBOX
            </div>

            <h1 style={styles.title}>
              Messages
            </h1>

            <p style={styles.subtitle}>
              Manage contact enquiries and
              conversations from one place.
            </p>
          </div>

          <a
            href="/admin"
            style={styles.dashboardLink}
          >
            ← Dashboard
          </a>
        </header>

        {error ? (
          <div style={styles.errorBox}>
            <strong>Message error</strong>
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              style={styles.errorClose}
            >
              ×
            </button>
          </div>
        ) : null}

        <section style={styles.statsGrid}>
          <StatCard
            label="TOTAL"
            value={stats.total}
          />

          <StatCard
            label="NEW"
            value={stats.new}
            accent
          />

          <StatCard
            label="READ"
            value={stats.read}
          />

          <StatCard
            label="REPLIED"
            value={stats.replied}
          />

          <StatCard
            label="ARCHIVED"
            value={stats.archived}
          />
        </section>

        <section style={styles.tableCard}>
          <div style={styles.toolbar}>
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email, subject..."
              style={styles.search}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              style={styles.select}
            >
              <option value="">
                All messages
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                loadMessages()
              }
              style={styles.refreshButton}
            >
              ↻ Refresh
            </button>
          </div>

          <div style={styles.tableHeader}>
            <span>MESSAGE</span>
            <span>SUBJECT</span>
            <span>STATUS</span>
            <span>RECEIVED</span>
          </div>

          {filteredMessages.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                ✉
              </div>

              <strong>
                No messages found
              </strong>

              <span>
                Contact enquiries submitted
                through the website will
                appear here.
              </span>
            </div>
          ) : (
            filteredMessages.map(
              (message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() =>
                    openMessage(message)
                  }
                  style={styles.messageRow}
                >
                  <div
                    style={styles.messagePerson}
                  >
                    <div
                      style={styles.avatar}
                    >
                      {initials(
                        message.name
                      )}
                    </div>

                    <div
                      style={
                        styles.personText
                      }
                    >
                      <strong
                        style={
                          styles.personName
                        }
                      >
                        {message.name}
                      </strong>

                      <span
                        style={
                          styles.personEmail
                        }
                      >
                        {message.email}
                      </span>
                    </div>
                  </div>

                  <div
                    style={styles.subjectCell}
                  >
                    <strong>
                      {message.subject ||
                        "Contact enquiry"}
                    </strong>

                    <span>
                      {message.message
                        ?.slice(0, 70)}
                      {message.message?.length >
                      70
                        ? "..."
                        : ""}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        ...styles.badge,
                        ...getStatusStyle(
                          message.status
                        ),
                      }}
                    >
                      {statusLabel(
                        message.status
                      )}
                    </span>
                  </div>

                  <div
                    style={
                      styles.createdCell
                    }
                  >
                    {formatDate(
                      message.created_at
                    )}
                  </div>
                </button>
              )
            )
          )}
        </section>
      </main>

      {selectedMessage ? (
        <div
          style={styles.backdrop}
          onClick={() =>
            setSelectedMessage(null)
          }
        >
          <aside
            style={styles.drawer}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div style={styles.drawerHeader}>
              <div>
                <div style={styles.eyebrow}>
                  CONTACT MESSAGE
                </div>

                <h2
                  style={styles.drawerTitle}
                >
                  {selectedMessage.name}
                </h2>

                <p
                  style={
                    styles.drawerSubtitle
                  }
                >
                  Received{" "}
                  {formatDateTime(
                    selectedMessage.created_at
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.drawerBody}>
              <div style={styles.actionRow}>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  style={styles.actionButton}
                >
                  ✉ Reply by Email
                </a>

                {selectedMessage.phone ? (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    style={styles.actionButton}
                  >
                    ☎ Call
                  </a>
                ) : null}
              </div>

              <section
                style={styles.section}
              >
                <div style={styles.sectionTitle}>
                  MESSAGE STATUS
                </div>

                <select
                  value={
                    selectedMessage.status ||
                    "new"
                  }
                  disabled={updating}
                  onChange={(event) =>
                    updateMessageStatus(
                      selectedMessage,
                      event.target.value
                    )
                  }
                  style={styles.drawerSelect}
                >
                  {STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </section>

              <section
                style={styles.section}
              >
                <div style={styles.sectionTitle}>
                  CONTACT
                </div>

                <div style={styles.infoGrid}>
                  <InfoItem
                    label="Name"
                    value={
                      selectedMessage.name
                    }
                  />

                  <InfoItem
                    label="Email"
                    value={
                      selectedMessage.email
                    }
                  />

                  <InfoItem
                    label="Phone"
                    value={
                      selectedMessage.phone
                    }
                  />

                  <InfoItem
                    label="Subject"
                    value={
                      selectedMessage.subject
                    }
                  />
                </div>
              </section>

              <section
                style={styles.section}
              >
                <div style={styles.sectionTitle}>
                  MESSAGE
                </div>

                <div
                  style={
                    styles.messageContent
                  }
                >
                  {selectedMessage.message}
                </div>
              </section>

              <section
                style={styles.section}
              >
                <div style={styles.sectionTitle}>
                  QUICK ACTIONS
                </div>

                <div
                  style={
                    styles.quickActions
                  }
                >
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() =>
                      updateMessageStatus(
                        selectedMessage,
                        "replied"
                      )
                    }
                    style={styles.quickButton}
                  >
                    Mark as replied
                  </button>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() =>
                      updateMessageStatus(
                        selectedMessage,
                        "archived"
                      )
                    }
                    style={styles.quickButton}
                  >
                    Archive
                  </button>
                </div>
              </section>

              <section
                style={styles.dangerSection}
              >
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    deleteMessage(
                      selectedMessage
                    )
                  }
                  style={styles.deleteButton}
                >
                  Delete message
                </button>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statLabel}>
        {label}
      </span>

      <strong
        style={{
          ...styles.statValue,
          ...(accent
            ? { color: "#29e0ff" }
            : {}),
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 75% 0%, rgba(18,49,102,.24), transparent 38%), #03070d",
    color: "#eceff5",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    display: "flex",
  },

  sidebar: {
    width: 284,
    minHeight: "100vh",
    borderRight:
      "1px solid rgba(255,255,255,.08)",
    background: "#040910",
    padding: "30px 18px",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "#fff",
    padding: "4px 12px 30px",
  },

  brandLogo: {
    width: 42,
    height: 42,
    objectFit: "contain",
  },

  brandName: {
    display: "block",
    fontSize: 16,
    letterSpacing: ".04em",
  },

  brandSub: {
    display: "block",
    marginTop: 3,
    color: "#587ca5",
    fontSize: 9,
    letterSpacing: ".18em",
  },

  sidebarLabel: {
    color: "#476789",
    fontSize: 9,
    letterSpacing: ".2em",
    margin: "8px 14px 10px",
  },

  sidebarLink: {
    minHeight: 42,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 14px",
    borderRadius: 12,
    color: "#91a5bd",
    textDecoration: "none",
    fontSize: 12,
    marginBottom: 3,
    flexShrink: 0,
  },

  sidebarActive: {
    color: "#fff",
    background:
      "linear-gradient(90deg, rgba(47,127,255,.15), rgba(18,49,102,.28))",
    border:
      "1px solid rgba(47,127,255,.1)",
  },

  sidebarDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#2f7fff",
    boxShadow:
      "0 0 12px rgba(47,127,255,.8)",
    flexShrink: 0,
  },

  sidebarBottom: {
    marginTop: "auto",
    borderTop:
      "1px solid rgba(255,255,255,.07)",
    padding: "18px 12px 0",
  },

  userEmail: {
    color: "#c7cedc",
    fontSize: 11,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  signOut: {
    marginTop: 12,
    border: 0,
    background: "transparent",
    color: "#6384a7",
    padding: 0,
    cursor: "pointer",
    fontSize: 11,
  },

  main: {
    marginLeft: 284,
    width: "calc(100% - 284px)",
    padding: "32px 60px 70px",
    maxWidth: 1600,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 30,
    marginBottom: 34,
  },

  eyebrow: {
    color: "#4d81b4",
    fontSize: 10,
    letterSpacing: ".2em",
    marginBottom: 10,
  },

  title: {
    margin: 0,
    fontSize: "clamp(42px, 5vw, 64px)",
    lineHeight: .98,
    letterSpacing: "-.055em",
    fontWeight: 750,
  },

  subtitle: {
    margin: "18px 0 0",
    color: "#7290af",
    fontSize: 15,
    maxWidth: 650,
  },

  dashboardLink: {
    color: "#29e0ff",
    textDecoration: "none",
    fontSize: 12,
    paddingTop: 10,
  },

  errorBox: {
    marginBottom: 20,
    padding: "13px 16px",
    borderRadius: 12,
    border:
      "1px solid rgba(255,80,100,.25)",
    background:
      "rgba(255,60,80,.07)",
    color: "#ff9ba7",
    display: "flex",
    gap: 12,
    alignItems: "center",
    fontSize: 12,
  },

  errorClose: {
    marginLeft: "auto",
    border: 0,
    background: "transparent",
    color: "#ff9ba7",
    cursor: "pointer",
    fontSize: 18,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    minHeight: 125,
    border:
      "1px solid rgba(255,255,255,.09)",
    borderRadius: 16,
    background:
      "linear-gradient(145deg, rgba(13,27,45,.78), rgba(4,10,17,.92))",
    padding: "22px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  statLabel: {
    color: "#527495",
    fontSize: 9,
    letterSpacing: ".17em",
  },

  statValue: {
    fontSize: 34,
    fontWeight: 650,
    letterSpacing: "-.04em",
  },

  tableCard: {
    border:
      "1px solid rgba(255,255,255,.09)",
    borderRadius: 18,
    background:
      "rgba(4,11,19,.84)",
    overflow: "hidden",
  },

  toolbar: {
    display: "grid",
    gridTemplateColumns:
      "minmax(240px, 1fr) 190px auto",
    gap: 10,
    padding: 18,
    borderBottom:
      "1px solid rgba(255,255,255,.07)",
  },

  search: {
    width: "100%",
    height: 44,
    boxSizing: "border-box",
    border:
      "1px solid rgba(255,255,255,.1)",
    borderRadius: 10,
    background:
      "rgba(10,23,38,.9)",
    color: "#eaf2fb",
    padding: "0 14px",
    outline: "none",
    fontSize: 12,
  },

  select: {
    height: 44,
    border:
      "1px solid rgba(255,255,255,.1)",
    borderRadius: 10,
    background: "#081421",
    color: "#b9c8d8",
    padding: "0 12px",
    outline: "none",
    fontSize: 12,
  },

  refreshButton: {
    height: 44,
    border:
      "1px solid rgba(41,224,255,.18)",
    borderRadius: 10,
    background:
      "rgba(41,224,255,.06)",
    color: "#70dced",
    padding: "0 15px",
    cursor: "pointer",
    fontSize: 11,
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns:
      "1.25fr 1.8fr .8fr .8fr",
    gap: 15,
    padding: "15px 20px",
    color: "#476784",
    fontSize: 8,
    letterSpacing: ".18em",
    borderBottom:
      "1px solid rgba(255,255,255,.06)",
  },

  messageRow: {
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "1.25fr 1.8fr .8fr .8fr",
    gap: 15,
    alignItems: "center",
    padding: "17px 20px",
    border: 0,
    borderBottom:
      "1px solid rgba(255,255,255,.055)",
    background: "transparent",
    color: "inherit",
    textAlign: "left",
    cursor: "pointer",
  },

  messagePerson: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background:
      "linear-gradient(135deg, #123166, #0c3a4a)",
    border:
      "1px solid rgba(41,224,255,.16)",
    color: "#8fc6ff",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },

  personText: {
    minWidth: 0,
  },

  personName: {
    display: "block",
    color: "#edf2f8",
    fontSize: 12,
  },

  personEmail: {
    display: "block",
    color: "#627c98",
    fontSize: 10,
    marginTop: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  subjectCell: {
    minWidth: 0,
  },

  subjectCellStrong: {
    color: "#dfe9f4",
  },

  createdCell: {
    color: "#627991",
    fontSize: 10,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid",
    borderRadius: 999,
    padding: "6px 9px",
    fontSize: 9,
    whiteSpace: "nowrap",
  },

  empty: {
    minHeight: 280,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    color: "#617b96",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: 34,
    color: "#29e0ff",
    opacity: .65,
    marginBottom: 8,
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,4,9,.7)",
    backdropFilter: "blur(8px)",
    zIndex: 100,
    display: "flex",
    justifyContent: "flex-end",
  },

  drawer: {
    width: "min(620px, 100vw)",
    height: "100%",
    background:
      "linear-gradient(180deg, #07121f, #03080e)",
    borderLeft:
      "1px solid rgba(255,255,255,.1)",
    boxShadow:
      "-30px 0 80px rgba(0,0,0,.45)",
    display: "flex",
    flexDirection: "column",
  },

  drawerHeader: {
    padding: "28px 30px 22px",
    borderBottom:
      "1px solid rgba(255,255,255,.08)",
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
  },

  drawerTitle: {
    margin: 0,
    fontSize: 30,
    letterSpacing: "-.04em",
  },

  drawerSubtitle: {
    margin: "6px 0 0",
    color: "#66819e",
    fontSize: 11,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border:
      "1px solid rgba(255,255,255,.1)",
    background:
      "rgba(255,255,255,.035)",
    color: "#b7c5d4",
    fontSize: 23,
    cursor: "pointer",
  },

  drawerBody: {
    overflowY: "auto",
    padding: "22px 30px 50px",
  },

  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 22,
  },

  actionButton: {
    color: "#a9c8e7",
    textDecoration: "none",
    border:
      "1px solid rgba(41,224,255,.14)",
    background:
      "rgba(41,224,255,.045)",
    borderRadius: 9,
    padding: "9px 13px",
    fontSize: 11,
  },

  section: {
    padding: "22px 0",
    borderTop:
      "1px solid rgba(255,255,255,.07)",
  },

  sectionTitle: {
    color: "#6e9bc5",
    fontSize: 9,
    letterSpacing: ".18em",
    marginBottom: 13,
  },

  drawerSelect: {
    width: "100%",
    height: 44,
    border:
      "1px solid rgba(255,255,255,.1)",
    borderRadius: 9,
    background: "#091827",
    color: "#dce7f2",
    padding: "0 11px",
    outline: "none",
    fontSize: 11,
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 10,
  },

  infoItem: {
    padding: "12px",
    border:
      "1px solid rgba(255,255,255,.055)",
    borderRadius: 9,
    background:
      "rgba(255,255,255,.02)",
    minWidth: 0,
  },

  infoItemSpan: {
    display: "block",
    color: "#54708d",
    fontSize: 9,
    marginBottom: 5,
  },

  messageContent: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.75,
    color: "#c5d1de",
    fontSize: 13,
    padding: "16px",
    border:
      "1px solid rgba(255,255,255,.06)",
    borderRadius: 11,
    background:
      "rgba(255,255,255,.02)",
  },

  quickActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  quickButton: {
    border:
      "1px solid rgba(41,224,255,.16)",
    background:
      "rgba(41,224,255,.05)",
    color: "#80dced",
    borderRadius: 8,
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: 10,
  },

  dangerSection: {
    borderTop:
      "1px solid rgba(255,255,255,.07)",
    paddingTop: 20,
  },

  deleteButton: {
    border:
      "1px solid rgba(255,80,100,.18)",
    background:
      "rgba(255,80,100,.05)",
    color: "#e58a96",
    borderRadius: 8,
    padding: "8px 11px",
    cursor: "pointer",
    fontSize: 10,
  },

  loadingScreen: {
    minHeight: "100vh",
    background: "#03070d",
    color: "#eceff5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },

  spinner: {
    width: 28,
    height: 28,
    border:
      "2px solid rgba(255,255,255,.1)",
    borderTopColor: "#29e0ff",
    borderRadius: "50%",
    animation:
      "cevtexa-spin .8s linear infinite",
  },

  loadingText: {
    color: "#63809e",
    fontSize: 11,
  },
};