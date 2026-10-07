"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
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

function statusLabel(value) {
  return (
    STATUS_OPTIONS.find((item) => item.value === value)?.label ||
    value ||
    "Unknown"
  );
}

function priorityLabel(value) {
  return (
    PRIORITY_OPTIONS.find((item) => item.value === value)?.label ||
    value ||
    "Normal"
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

export default function LeadsPage() {
  const [supabase, setSupabase] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [leads, setLeads] = useState([]);
  const [staff, setStaff] = useState([]);

  const [selectedLead, setSelectedLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingLead, setUpdatingLead] = useState(false);

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

        const { data: currentProfile, error: profileError } = await client
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (
          !currentProfile ||
          !["owner", "admin"].includes(currentProfile.role)
        ) {
          await client.auth.signOut();
          window.location.href = "/admin/login";
          return;
        }

        if (!mounted) return;

        setUser(currentUser);
        setProfile(currentProfile);

        await loadData(client);
      } catch (err) {
        console.error("CRM initialization error:", err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load the CRM. Please refresh and try again."
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

  async function loadData(client = supabase) {
    if (!client) return;

    try {
      setLoading(true);
      setError("");

      const [leadsResult, staffResult] = await Promise.all([
        client
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false }),

        client
          .from("profiles")
          .select("id, full_name, email, role")
          .in("role", ["owner", "admin", "editor", "staff"])
          .order("full_name", { ascending: true }),
      ]);

      if (leadsResult.error) {
        throw leadsResult.error;
      }

      if (staffResult.error) {
        throw staffResult.error;
      }

      setLeads(leadsResult.data || []);
      setStaff(staffResult.data || []);
    } catch (err) {
      console.error("CRM loading error:", err);

      setError(
        err?.message ||
          "Unable to load leads. Please refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openLead(lead) {
    if (!supabase) return;

    setSelectedLead(lead);
    setNotes([]);
    setActivities([]);
    setNoteText("");
    setLoadingDetails(true);

    try {
      const [notesResult, activitiesResult] = await Promise.all([
        supabase
          .from("lead_notes")
          .select("*")
          .eq("lead_id", lead.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("lead_activities")
          .select("*")
          .eq("lead_id", lead.id)
          .order("created_at", { ascending: false }),
      ]);

      if (notesResult.error) {
        console.error("Notes loading error:", notesResult.error);
      }

      if (activitiesResult.error) {
        console.error(
          "Activities loading error:",
          activitiesResult.error
        );
      }

      setNotes(notesResult.data || []);
      setActivities(activitiesResult.data || []);
    } catch (err) {
      console.error("Lead detail error:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  function updateLocalLead(id, updates) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              ...updates,
            }
          : lead
      )
    );

    setSelectedLead((current) =>
      current && current.id === id
        ? {
            ...current,
            ...updates,
          }
        : current
    );
  }

  async function updateLeadField(field, value) {
    if (!supabase || !selectedLead) return;

    const previousValue = selectedLead[field];

    if (previousValue === value) return;

    try {
      setUpdatingLead(true);
      setError("");

      const { error: updateError } = await supabase
        .from("leads")
        .update({
          [field]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedLead.id);

      if (updateError) {
        throw updateError;
      }

      updateLocalLead(selectedLead.id, {
        [field]: value,
      });

      let activityType = "lead_updated";
      let description = "Lead updated.";

      if (field === "status") {
        activityType = "status_changed";
        description = `Status changed from "${statusLabel(
          previousValue
        )}" to "${statusLabel(value)}".`;
      }

      if (field === "priority") {
        activityType = "priority_changed";
        description = `Priority changed from "${priorityLabel(
          previousValue
        )}" to "${priorityLabel(value)}".`;
      }

      if (field === "assigned_to") {
        activityType = "assignment_changed";

        const assignedPerson = staff.find(
          (person) => person.id === value
        );

        description = assignedPerson
          ? `Lead assigned to ${
              assignedPerson.full_name ||
              assignedPerson.email ||
              "team member"
            }.`
          : "Lead assignment removed.";
      }

      await addActivity(
        selectedLead.id,
        activityType,
        description,
        false
      );
    } catch (err) {
      console.error("Lead update error:", err);

      setError(
        err?.message ||
          "Unable to update this lead. Please try again."
      );
    } finally {
      setUpdatingLead(false);
    }
  }

  async function addActivity(
    leadId,
    activityType,
    description,
    refresh = true
  ) {
    if (!supabase || !user) return;

    const { data, error: activityError } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        user_id: user.id,
        activity_type: activityType,
        description,
      })
      .select("*")
      .single();

    if (activityError) {
      console.error("Activity insert error:", activityError);
      return;
    }

    if (refresh) {
      setActivities((current) => [
        data,
        ...current,
      ]);
    } else if (selectedLead?.id === leadId) {
      setActivities((current) => [
        data,
        ...current,
      ]);
    }
  }

  async function saveNote() {
    if (!supabase || !user || !selectedLead) return;

    const cleanNote = noteText.trim();

    if (!cleanNote) return;

    try {
      setSavingNote(true);
      setError("");

      const { data: note, error: noteError } = await supabase
        .from("lead_notes")
        .insert({
          lead_id: selectedLead.id,
          author_id: user.id,
          note: cleanNote,
        })
        .select("*")
        .single();

      if (noteError) {
        throw noteError;
      }

      setNotes((current) => [
        note,
        ...current,
      ]);

      setNoteText("");

      await addActivity(
        selectedLead.id,
        "note_added",
        "An internal note was added."
      );
    } catch (err) {
      console.error("Note error:", err);

      setError(
        err?.message ||
          "Unable to save the note. Please try again."
      );
    } finally {
      setSavingNote(false);
    }
  }

  async function deleteLead() {
    if (!supabase || !selectedLead) return;

    const confirmed = window.confirm(
      `Delete the lead "${selectedLead.full_name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("leads")
        .delete()
        .eq("id", selectedLead.id);

      if (deleteError) {
        throw deleteError;
      }

      setLeads((current) =>
        current.filter(
          (lead) => lead.id !== selectedLead.id
        )
      );

      setSelectedLead(null);
    } catch (err) {
      console.error("Delete lead error:", err);

      setError(
        err?.message ||
          "Unable to delete this lead."
      );
    }
  }

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const searchable = [
        lead.full_name,
        lead.company,
        lead.email,
        lead.phone,
        lead.whatsapp,
        lead.country,
        lead.city,
        lead.service_required,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesStatus =
        !statusFilter ||
        lead.status === statusFilter;

      const matchesPriority =
        !priorityFilter ||
        lead.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    leads,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter(
        (lead) => lead.status === "new"
      ).length,
      contacted: leads.filter(
        (lead) => lead.status === "contacted"
      ).length,
      qualified: leads.filter(
        (lead) => lead.status === "qualified"
      ).length,
      proposal: leads.filter(
        (lead) => lead.status === "proposal_sent"
      ).length,
      negotiation: leads.filter(
        (lead) => lead.status === "negotiation"
      ).length,
      won: leads.filter(
        (lead) => lead.status === "won"
      ).length,
      lost: leads.filter(
        (lead) => lead.status === "lost"
      ).length,
    }),
    [leads]
  );

  function getStaffName(id) {
    if (!id) return "Unassigned";

    const person = staff.find(
      (member) => member.id === id
    );

    return (
      person?.full_name ||
      person?.email ||
      "Assigned"
    );
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingScreen}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>
            Loading CEVTEXA CRM...
          </p>
        </div>
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
          CRM
        </div>

        <a
          href="/admin"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Overview
        </a>

        <div
          style={{
            ...styles.sidebarLink,
            ...styles.sidebarLinkActive,
          }}
        >
          <span style={styles.sidebarDot} />
          Leads / CRM
        </div>

        <a
          href="/admin/messages"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Messages
        </a>

        <a
          href="/admin/projects"
          style={styles.sidebarLink}
        >
          <span style={styles.sidebarDot} />
          Projects
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
              PIPELINE
            </div>

            <h1 style={styles.title}>
              Leads / CRM
            </h1>

            <p style={styles.subtitle}>
              Capture, qualify and move every
              opportunity through the pipeline.
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
            <strong>CRM error</strong>
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
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
            label="QUALIFIED"
            value={stats.qualified}
          />

          <StatCard
            label="WON"
            value={stats.won}
          />

          <StatCard
            label="CONTACTED"
            value={stats.contacted}
          />

          <StatCard
            label="PROPOSAL"
            value={stats.proposal}
          />
        </section>

        <section style={styles.pipelineBar}>
          <div>
            <span style={styles.pipelineLabel}>
              PIPELINE
            </span>
            <strong>
              {stats.total} opportunities
            </strong>
          </div>

          <div style={styles.pipelineSteps}>
            <PipelineStep
              label="New"
              value={stats.new}
            />
            <PipelineStep
              label="Contacted"
              value={stats.contacted}
            />
            <PipelineStep
              label="Qualified"
              value={stats.qualified}
            />
            <PipelineStep
              label="Proposal"
              value={stats.proposal}
            />
            <PipelineStep
              label="Won"
              value={stats.won}
            />
          </div>
        </section>

        <section style={styles.tableCard}>
          <div style={styles.toolbar}>
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, company, email..."
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
                All statuses
              </option>

              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              style={styles.select}
            >
              <option value="">
                All priorities
              </option>

              {PRIORITY_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => loadData()}
              style={styles.refreshButton}
            >
              ↻ Refresh
            </button>
          </div>

          <div style={styles.tableHeader}>
            <span>LEAD</span>
            <span>SERVICE</span>
            <span>STATUS</span>
            <span>PRIORITY</span>
            <span>ASSIGNED</span>
            <span>CREATED</span>
          </div>

          {filteredLeads.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                ◎
              </div>

              <strong>
                No leads found
              </strong>

              <span>
                Try changing your filters or
                submit a new enquiry from the
                website.
              </span>
            </div>
          ) : (
            <div>
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  style={styles.row}
                  onClick={() =>
                    openLead(lead)
                  }
                >
                  <div style={styles.leadCell}>
                    <div
                      style={styles.avatar}
                    >
                      {initials(
                        lead.full_name
                      )}
                    </div>

                    <div>
                      <strong
                        style={
                          styles.leadName
                        }
                      >
                        {lead.full_name}
                      </strong>

                      <span
                        style={
                          styles.leadCompany
                        }
                      >
                        {lead.company ||
                          lead.email}
                      </span>
                    </div>
                  </div>

                  <div
                    style={styles.serviceCell}
                  >
                    {lead.service_required ||
                      "—"}
                  </div>

                  <div>
                    <span
                      style={{
                        ...styles.badge,
                        ...getStatusStyle(
                          lead.status
                        ),
                      }}
                    >
                      {statusLabel(
                        lead.status
                      )}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        ...styles.badge,
                        ...getPriorityStyle(
                          lead.priority
                        ),
                      }}
                    >
                      {priorityLabel(
                        lead.priority
                      )}
                    </span>
                  </div>

                  <div
                    style={
                      styles.assignedCell
                    }
                  >
                    {getStaffName(
                      lead.assigned_to
                    )}
                  </div>

                  <div
                    style={
                      styles.createdCell
                    }
                  >
                    {formatDate(
                      lead.created_at
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedLead ? (
        <div
          style={styles.drawerBackdrop}
          onClick={() =>
            setSelectedLead(null)
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
                  LEAD PROFILE
                </div>

                <h2
                  style={styles.drawerTitle}
                >
                  {selectedLead.full_name}
                </h2>

                <p
                  style={
                    styles.drawerSubtitle
                  }
                >
                  {selectedLead.company ||
                    "Independent enquiry"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLead(null)
                }
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.drawerBody}>
              <div style={styles.actionGrid}>
                <a
                  href={`mailto:${selectedLead.email}`}
                  style={styles.actionButton}
                >
                  ✉ Email
                </a>

                {selectedLead.phone ? (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    style={styles.actionButton}
                  >
                    ☎ Call
                  </a>
                ) : null}

                {selectedLead.whatsapp ? (
                  <a
                    href={`https://wa.me/${String(
                      selectedLead.whatsapp
                    ).replace(
                      /\D/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.actionButton}
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>

              <section
                style={styles.drawerSection}
              >
                <div
                  style={
                    styles.sectionHeading
                  }
                >
                  Pipeline
                </div>

                <div
                  style={styles.controlGrid}
                >
                  <label
                    style={styles.control}
                  >
                    <span>Status</span>

                    <select
                      value={
                        selectedLead.status ||
                        "new"
                      }
                      disabled={updatingLead}
                      onChange={(event) =>
                        updateLeadField(
                          "status",
                          event.target.value
                        )
                      }
                      style={
                        styles.drawerSelect
                      }
                    >
                      {STATUS_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label
                    style={styles.control}
                  >
                    <span>Priority</span>

                    <select
                      value={
                        selectedLead.priority ||
                        "normal"
                      }
                      disabled={updatingLead}
                      onChange={(event) =>
                        updateLeadField(
                          "priority",
                          event.target.value
                        )
                      }
                      style={
                        styles.drawerSelect
                      }
                    >
                      {PRIORITY_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                <label
                  style={{
                    ...styles.control,
                    marginTop: 12,
                  }}
                >
                  <span>Assigned to</span>

                  <select
                    value={
                      selectedLead.assigned_to ||
                      ""
                    }
                    disabled={updatingLead}
                    onChange={(event) =>
                      updateLeadField(
                        "assigned_to",
                        event.target.value ||
                          null
                      )
                    }
                    style={
                      styles.drawerSelect
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {staff.map((person) => (
                      <option
                        key={person.id}
                        value={person.id}
                      >
                        {person.full_name ||
                          person.email}
                        {person.role
                          ? ` · ${person.role}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section
                style={styles.drawerSection}
              >
                <div
                  style={
                    styles.sectionHeading
                  }
                >
                  Contact
                </div>

                <InfoGrid
                  items={[
                    [
                      "Email",
                      selectedLead.email,
                    ],
                    [
                      "Phone",
                      selectedLead.phone,
                    ],
                    [
                      "WhatsApp",
                      selectedLead.whatsapp,
                    ],
                    [
                      "Country",
                      selectedLead.country,
                    ],
                    [
                      "City",
                      selectedLead.city,
                    ],
                    [
                      "Website",
                      selectedLead.website,
                    ],
                  ]}
                />
              </section>

              <section
                style={styles.drawerSection}
              >
                <div
                  style={
                    styles.sectionHeading
                  }
                >
                  Opportunity
                </div>

                <InfoGrid
                  items={[
                    [
                      "Service",
                      selectedLead.service_required,
                    ],
                    [
                      "Industry",
                      selectedLead.industry,
                    ],
                    [
                      "Budget",
                      selectedLead.budget_range,
                    ],
                    [
                      "Timeline",
                      selectedLead.expected_timeline,
                    ],
                    [
                      "Contact method",
                      selectedLead.preferred_contact_method,
                    ],
                    [
                      "Lead source",
                      selectedLead.lead_source,
                    ],
                  ]}
                />

                {selectedLead.project_description ? (
                  <div
                    style={
                      styles.descriptionBox
                    }
                  >
                    <span>
                      PROJECT DESCRIPTION
                    </span>

                    <p>
                      {
                        selectedLead.project_description
                      }
                    </p>
                  </div>
                ) : null}

                {selectedLead.current_website ? (
                  <div
                    style={
                      styles.descriptionBox
                    }
                  >
                    <span>
                      CURRENT WEBSITE
                    </span>

                    <p>
                      {
                        selectedLead.current_website
                      }
                    </p>
                  </div>
                ) : null}
              </section>

              <section
                style={styles.drawerSection}
              >
                <div
                  style={
                    styles.sectionHeading
                  }
                >
                  Internal notes
                </div>

                <div
                  style={
                    styles.noteComposer
                  }
                >
                  <textarea
                    value={noteText}
                    onChange={(event) =>
                      setNoteText(
                        event.target.value
                      )
                    }
                    placeholder="Add an internal note..."
                    rows={4}
                    style={styles.noteInput}
                  />

                  <button
                    type="button"
                    onClick={saveNote}
                    disabled={
                      savingNote ||
                      !noteText.trim()
                    }
                    style={
                      styles.primaryButton
                    }
                  >
                    {savingNote
                      ? "Saving..."
                      : "Add note"}
                  </button>
                </div>

                <div
                  style={
                    styles.notesList
                  }
                >
                  {loadingDetails ? (
                    <div
                      style={
                        styles.miniLoading
                      }
                    >
                      Loading notes...
                    </div>
                  ) : notes.length === 0 ? (
                    <div
                      style={
                        styles.miniEmpty
                      }
                    >
                      No internal notes yet.
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        style={styles.noteItem}
                      >
                        <div
                          style={
                            styles.noteTop
                          }
                        >
                          <span>
                            Internal note
                          </span>

                          <time>
                            {formatDateTime(
                              note.created_at
                            )}
                          </time>
                        </div>

                        <p>
                          {note.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section
                style={styles.drawerSection}
              >
                <div
                  style={
                    styles.sectionHeading
                  }
                >
                  Activity
                </div>

                {activities.length === 0 ? (
                  <div
                    style={
                      styles.miniEmpty
                    }
                  >
                    No activity recorded yet.
                  </div>
                ) : (
                  <div
                    style={
                      styles.activityList
                    }
                  >
                    {activities.map(
                      (activity) => (
                        <div
                          key={activity.id}
                          style={
                            styles.activityItem
                          }
                        >
                          <div
                            style={
                              styles.activityDot
                            }
                          />

                          <div>
                            <strong>
                              {activity.description ||
                                activity.activity_type}
                            </strong>

                            <span>
                              {formatDateTime(
                                activity.created_at
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section
                style={styles.dangerSection}
              >
                <button
                  type="button"
                  onClick={deleteLead}
                  style={styles.deleteButton}
                >
                  Delete lead
                </button>

                <span>
                  Created{" "}
                  {formatDate(
                    selectedLead.created_at
                  )}
                </span>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, accent }) {
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

function PipelineStep({ label, value }) {
  return (
    <div style={styles.pipelineStep}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoGrid({ items }) {
  return (
    <div style={styles.infoGrid}>
      {items.map(([label, value]) => (
        <div
          key={label}
          style={styles.infoItem}
        >
          <span>{label}</span>

          <strong>
            {value || "—"}
          </strong>
        </div>
      ))}
    </div>
  );
}

function getStatusStyle(status) {
  const stylesByStatus = {
    new: {
      color: "#8fc6ff",
      borderColor:
        "rgba(143,198,255,.28)",
      background:
        "rgba(47,127,255,.10)",
    },
    contacted: {
      color: "#b6f4ff",
      borderColor:
        "rgba(41,224,255,.25)",
      background:
        "rgba(41,224,255,.08)",
    },
    qualified: {
      color: "#d7f7ff",
      borderColor:
        "rgba(182,244,255,.3)",
      background:
        "rgba(182,244,255,.08)",
    },
    proposal_sent: {
      color: "#c7cedc",
      borderColor:
        "rgba(199,206,220,.22)",
      background:
        "rgba(199,206,220,.06)",
    },
    negotiation: {
      color: "#ffffff",
      borderColor:
        "rgba(255,255,255,.25)",
      background:
        "rgba(255,255,255,.07)",
    },
    won: {
      color: "#29e0ff",
      borderColor:
        "rgba(41,224,255,.35)",
      background:
        "rgba(41,224,255,.12)",
    },
    lost: {
      color: "#8b93a6",
      borderColor:
        "rgba(139,147,166,.2)",
      background:
        "rgba(139,147,166,.06)",
    },
  };

  return (
    stylesByStatus[status] ||
    stylesByStatus.new
  );
}

function getPriorityStyle(priority) {
  const stylesByPriority = {
    low: {
      color: "#8b93a6",
      borderColor:
        "rgba(139,147,166,.2)",
      background:
        "rgba(139,147,166,.05)",
    },
    normal: {
      color: "#c7cedc",
      borderColor:
        "rgba(199,206,220,.2)",
      background:
        "rgba(199,206,220,.05)",
    },
    high: {
      color: "#8fc6ff",
      borderColor:
        "rgba(143,198,255,.3)",
      background:
        "rgba(47,127,255,.08)",
    },
    urgent: {
      color: "#ffffff",
      borderColor:
        "rgba(41,224,255,.4)",
      background:
        "rgba(41,224,255,.1)",
    },
  };

  return (
    stylesByPriority[priority] ||
    stylesByPriority.normal
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
    minHeight: 46,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 14px",
    borderRadius: 12,
    color: "#91a5bd",
    textDecoration: "none",
    fontSize: 13,
    marginBottom: 4,
  },

  sidebarLinkActive: {
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

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(6, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 14,
  },

  statCard: {
    minHeight: 130,
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

  pipelineBar: {
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(6,14,24,.78)",
    borderRadius: 16,
    padding: "17px 20px",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 30,
  },

  pipelineLabel: {
    display: "block",
    color: "#4d7194",
    fontSize: 8,
    letterSpacing: ".18em",
    marginBottom: 5,
  },

  pipelineSteps: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  pipelineStep: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 8,
    background:
      "rgba(255,255,255,.035)",
    color: "#8097b0",
    fontSize: 10,
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
      "minmax(220px, 1.6fr) minmax(150px, 1fr) minmax(150px, 1fr) auto",
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
      "1.7fr 1.2fr .9fr .9fr 1fr .8fr",
    gap: 12,
    padding: "15px 20px",
    color: "#476784",
    fontSize: 8,
    letterSpacing: ".18em",
    borderBottom:
      "1px solid rgba(255,255,255,.06)",
  },

  row: {
    display: "grid",
    gridTemplateColumns:
      "1.7fr 1.2fr .9fr .9fr 1fr .8fr",
    gap: 12,
    alignItems: "center",
    padding: "16px 20px",
    borderBottom:
      "1px solid rgba(255,255,255,.055)",
    cursor: "pointer",
    transition: "background .2s ease",
  },

  leadCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  avatar: {
    width: 38,
    height: 38,
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

  leadName: {
    display: "block",
    color: "#edf2f8",
    fontSize: 12,
  },

  leadCompany: {
    display: "block",
    color: "#627c98",
    fontSize: 10,
    marginTop: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 220,
  },

  serviceCell: {
    color: "#a4b7cb",
    fontSize: 11,
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

  assignedCell: {
    color: "#7891aa",
    fontSize: 10,
  },

  createdCell: {
    color: "#627991",
    fontSize: 10,
  },

  empty: {
    minHeight: 240,
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
    color: "#2f7fff",
    opacity: .65,
    marginBottom: 8,
  },

  drawerBackdrop: {
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
    width: "min(640px, 100vw)",
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
    fontSize: 12,
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

  actionGrid: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 25,
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

  drawerSection: {
    padding: "22px 0",
    borderTop:
      "1px solid rgba(255,255,255,.07)",
  },

  sectionHeading: {
    color: "#6e9bc5",
    fontSize: 9,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    marginBottom: 14,
  },

  controlGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 10,
  },

  control: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },

  drawerSelect: {
    height: 42,
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
    padding: "11px 12px",
    border:
      "1px solid rgba(255,255,255,.055)",
    borderRadius: 9,
    background:
      "rgba(255,255,255,.02)",
    minWidth: 0,
  },

  descriptionBox: {
    marginTop: 10,
    padding: "13px 14px",
    border:
      "1px solid rgba(255,255,255,.055)",
    borderRadius: 10,
    background:
      "rgba(255,255,255,.02)",
  },

  noteComposer: {
    padding: 12,
    border:
      "1px solid rgba(255,255,255,.08)",
    borderRadius: 11,
    background:
      "rgba(255,255,255,.025)",
  },

  noteInput: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    border: 0,
    outline: 0,
    background: "transparent",
    color: "#e8eff7",
    fontSize: 12,
    lineHeight: 1.6,
  },

  primaryButton: {
    marginTop: 10,
    border: 0,
    borderRadius: 8,
    background:
      "linear-gradient(90deg, #2f7fff, #29e0ff)",
    color: "#02101a",
    padding: "9px 14px",
    fontWeight: 700,
    fontSize: 11,
    cursor: "pointer",
  },

  notesList: {
    marginTop: 12,
    display: "grid",
    gap: 8,
  },

  noteItem: {
    padding: 12,
    border:
      "1px solid rgba(255,255,255,.06)",
    borderRadius: 10,
    background:
      "rgba(255,255,255,.018)",
  },

  noteTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#5f88af",
    fontSize: 9,
  },

  activityList: {
    display: "grid",
    gap: 13,
  },

  activityItem: {
    display: "flex",
    gap: 12,
  },

  activityDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#29e0ff",
    boxShadow:
      "0 0 12px rgba(41,224,255,.65)",
    marginTop: 5,
    flexShrink: 0,
  },

  dangerSection: {
    borderTop:
      "1px solid rgba(255,255,255,.07)",
    paddingTop: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    color: "#4d657d",
    fontSize: 9,
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

  miniLoading: {
    color: "#64809d",
    fontSize: 10,
    padding: 12,
  },

  miniEmpty: {
    color: "#526b83",
    fontSize: 10,
    padding: "10px 0",
  },

  loadingScreen: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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