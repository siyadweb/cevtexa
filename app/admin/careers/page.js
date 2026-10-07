"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

const EMPTY_FORM = {
  title: "",
  slug: "",
  department: "",
  location: "",
  employment_type: "",
  description: "",
  requirements: "",
  is_active: true,
};

const APPLICATION_STATUSES = [
  "new",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
];

export default function CareersAdminPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingApplication, setUpdatingApplication] =
    useState(false);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [activeView, setActiveView] = useState("positions");

  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] =
    useState("all");

  const [applicationSearch, setApplicationSearch] =
    useState("");
  const [applicationStatusFilter, setApplicationStatusFilter] =
    useState("all");
  const [applicationJobFilter, setApplicationJobFilter] =
    useState("all");

  const [showEditor, setShowEditor] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (
        error ||
        !profile ||
        !["owner", "admin"].includes(profile.role)
      ) {
        router.replace("/admin/login");
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      router.replace("/admin/login");
    }
  }

  async function loadData() {
    setLoading(true);

    try {
      const [jobsResult, applicationsResult] =
        await Promise.all([
          supabase
            .from("job_openings")
            .select("*")
            .order("created_at", { ascending: false }),

          supabase
            .from("job_applications")
            .select(
              "id, job_id, full_name, email, phone, resume_url, portfolio_url, cover_letter, status, created_at"
            )
            .order("created_at", { ascending: false }),
        ]);

      if (jobsResult.error) {
        throw jobsResult.error;
      }

      if (applicationsResult.error) {
        throw applicationsResult.error;
      }

      setJobs(jobsResult.data || []);
      setApplications(applicationsResult.data || []);
    } catch (error) {
      console.error("Careers load error:", error);

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to load careers data.",
      });
    } finally {
      setLoading(false);
    }
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreate() {
    setEditingJob(null);
    setForm({ ...EMPTY_FORM });
    setMessage({ type: "", text: "" });
    setShowEditor(true);
  }

  function openEdit(job) {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      slug: job.slug || "",
      department: job.department || "",
      location: job.location || "",
      employment_type: job.employment_type || "",
      description: job.description || "",
      requirements: job.requirements || "",
      is_active: job.is_active ?? true,
    });

    setMessage({ type: "", text: "" });
    setShowEditor(true);
  }

  function closeEditor() {
    if (saving) return;

    setShowEditor(false);
    setEditingJob(null);
    setForm({ ...EMPTY_FORM });
  }

  async function saveJob(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage({
        type: "error",
        text: "Job title is required.",
      });
      return;
    }

    if (!form.slug.trim()) {
      setMessage({
        type: "error",
        text: "Slug is required.",
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug),
        department: form.department.trim() || null,
        location: form.location.trim() || null,
        employment_type:
          form.employment_type.trim() || null,
        description:
          form.description.trim() || null,
        requirements:
          form.requirements.trim() || null,
        is_active: Boolean(form.is_active),
      };

      let error;

      if (editingJob) {
        ({ error } = await supabase
          .from("job_openings")
          .update(payload)
          .eq("id", editingJob.id));
      } else {
        ({ error } = await supabase
          .from("job_openings")
          .insert(payload));
      }

      if (error) {
        throw error;
      }

      await loadData();

      setShowEditor(false);
      setEditingJob(null);
      setForm({ ...EMPTY_FORM });

      setMessage({
        type: "success",
        text: editingJob
          ? "Job opening updated successfully."
          : "Job opening created successfully.",
      });
    } catch (error) {
      console.error("Save job error:", error);

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to save job opening.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleJob(job) {
    try {
      const { error } = await supabase
        .from("job_openings")
        .update({
          is_active: !job.is_active,
        })
        .eq("id", job.id);

      if (error) {
        throw error;
      }

      setJobs((current) =>
        current.map((item) =>
          item.id === job.id
            ? {
                ...item,
                is_active: !job.is_active,
              }
            : item
        )
      );

      setMessage({
        type: "success",
        text: job.is_active
          ? "Job opening deactivated."
          : "Job opening activated.",
      });
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to update job status.",
      });
    }
  }

  async function deleteJob(job) {
    const confirmed = window.confirm(
      `Delete "${job.title}"?\n\nThis will remove the job opening.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("job_openings")
        .delete()
        .eq("id", job.id);

      if (error) {
        throw error;
      }

      setJobs((current) =>
        current.filter((item) => item.id !== job.id)
      );

      setApplications((current) =>
        current.filter(
          (item) => item.job_id !== job.id
        )
      );

      setMessage({
        type: "success",
        text: "Job opening deleted successfully.",
      });
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to delete job opening.",
      });
    }
  }

  async function updateApplicationStatus(
    applicationId,
    status
  ) {
    setUpdatingApplication(true);

    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) {
        throw error;
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
              }
            : application
        )
      );

      setSelectedApplication((current) =>
        current && current.id === applicationId
          ? {
              ...current,
              status,
            }
          : current
      );

      setMessage({
        type: "success",
        text: `Application moved to ${status}.`,
      });
    } catch (error) {
      console.error(
        "Application status error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to update application status.",
      });
    } finally {
      setUpdatingApplication(false);
    }
  }

  const jobMap = useMemo(() => {
    const map = {};

    jobs.forEach((job) => {
      map[job.id] = job;
    });

    return map;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = jobSearch.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [
          job.title,
          job.department,
          job.location,
          job.employment_type,
          job.slug,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );

      const matchesStatus =
        jobStatusFilter === "all" ||
        (jobStatusFilter === "active" &&
          job.is_active) ||
        (jobStatusFilter === "inactive" &&
          !job.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [jobs, jobSearch, jobStatusFilter]);

  const filteredApplications = useMemo(() => {
    const query = applicationSearch
      .trim()
      .toLowerCase();

    return applications.filter((application) => {
      const job = jobMap[application.job_id];

      const matchesSearch =
        !query ||
        [
          application.full_name,
          application.email,
          application.phone,
          job?.title,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );

      const matchesStatus =
        applicationStatusFilter === "all" ||
        application.status ===
          applicationStatusFilter;

      const matchesJob =
        applicationJobFilter === "all" ||
        application.job_id ===
          applicationJobFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJob
      );
    });
  }, [
    applications,
    applicationSearch,
    applicationStatusFilter,
    applicationJobFilter,
    jobMap,
  ]);

  const activeJobs = jobs.filter(
    (job) => job.is_active
  ).length;

  const inactiveJobs = jobs.filter(
    (job) => !job.is_active
  ).length;

  const newApplications = applications.filter(
    (item) => item.status === "new"
  ).length;

  const reviewingApplications =
    applications.filter(
      (item) => item.status === "reviewing"
    ).length;

  const shortlistedApplications =
    applications.filter(
      (item) => item.status === "shortlisted"
    ).length;

  const hiredApplications = applications.filter(
    (item) => item.status === "hired"
  ).length;

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p>Loading careers...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header className="career-header">
          <div>
            <div style={styles.eyebrow}>
              TALENT SYSTEM
            </div>

            <h1 style={styles.title}>Careers</h1>

            <p style={styles.subtitle}>
              Manage positions and the complete
              applicant pipeline.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={loadData}
              style={styles.secondaryButton}
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              style={styles.primaryButton}
            >
              + New Position
            </button>
          </div>
        </header>

        {message.text && (
          <div
            style={{
              ...styles.message,
              ...(message.type === "success"
                ? styles.success
                : styles.error),
            }}
          >
            <span>
              {message.type === "success"
                ? "✓"
                : "!"}
            </span>

            {message.text}
          </div>
        )}

        <div style={styles.viewTabs}>
          <button
            type="button"
            onClick={() =>
              setActiveView("positions")
            }
            style={{
              ...styles.viewTab,
              ...(activeView === "positions"
                ? styles.viewTabActive
                : {}),
            }}
          >
            <span>Positions</span>
            <span style={styles.tabCount}>
              {jobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveView("applications")
            }
            style={{
              ...styles.viewTab,
              ...(activeView === "applications"
                ? styles.viewTabActive
                : {}),
            }}
          >
            <span>Applications</span>

            <span style={styles.tabCount}>
              {applications.length}
            </span>

            {newApplications > 0 && (
              <span style={styles.newBadge}>
                {newApplications}
              </span>
            )}
          </button>
        </div>

        {activeView === "positions" ? (
          <PositionsView
            jobs={jobs}
            filteredJobs={filteredJobs}
            applications={applications}
            search={jobSearch}
            setSearch={setJobSearch}
            statusFilter={jobStatusFilter}
            setStatusFilter={setJobStatusFilter}
            activeJobs={activeJobs}
            inactiveJobs={inactiveJobs}
            onCreate={openCreate}
            onEdit={openEdit}
            onToggle={toggleJob}
            onDelete={deleteJob}
            onApplications={() =>
              setActiveView("applications")
            }
          />
        ) : (
          <ApplicationsView
            applications={applications}
            filteredApplications={
              filteredApplications
            }
            jobs={jobs}
            jobMap={jobMap}
            search={applicationSearch}
            setSearch={setApplicationSearch}
            statusFilter={
              applicationStatusFilter
            }
            setStatusFilter={
              setApplicationStatusFilter
            }
            jobFilter={applicationJobFilter}
            setJobFilter={setApplicationJobFilter}
            newApplications={newApplications}
            reviewingApplications={
              reviewingApplications
            }
            shortlistedApplications={
              shortlistedApplications
            }
            hiredApplications={
              hiredApplications
            }
            onOpen={setSelectedApplication}
          />
        )}
      </div>

      {showEditor && (
        <JobEditor
          form={form}
          editingJob={editingJob}
          saving={saving}
          onChange={updateForm}
          onClose={closeEditor}
          onSave={saveJob}
        />
      )}

      {selectedApplication && (
        <ApplicationDrawer
          application={selectedApplication}
          job={jobMap[selectedApplication.job_id]}
          updating={updatingApplication}
          onClose={() =>
            setSelectedApplication(null)
          }
          onStatusChange={
            updateApplicationStatus
          }
        />
      )}

      <style jsx>{`
        .career-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (max-width: 1000px) {
          .career-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 900px) {
          :global(.career-stats-grid) {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            ) !important;
          }

          :global(.career-toolbar) {
            flex-direction: column;
            align-items: stretch !important;
          }

          :global(.career-search) {
            max-width: none !important;
          }
        }

        @media (max-width: 650px) {
          :global(.career-stats-grid) {
            grid-template-columns: 1fr !important;
          }

          :global(.career-page) {
            padding: 18px !important;
          }

          :global(.career-form-grid) {
            grid-template-columns: 1fr !important;
          }

          :global(.career-full-field) {
            grid-column: auto !important;
          }
        }
      `}</style>
    </main>
  );
}

function PositionsView({
  jobs,
  filteredJobs,
  applications,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  activeJobs,
  inactiveJobs,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
  onApplications,
}) {
  return (
    <>
      <section
        className="career-stats-grid"
        style={styles.statsGrid}
      >
        <Stat
          label="Total Positions"
          value={jobs.length}
          icon="◈"
        />

        <Stat
          label="Active"
          value={activeJobs}
          icon="✓"
        />

        <Stat
          label="Inactive"
          value={inactiveJobs}
          icon="○"
        />

        <Stat
          label="Applications"
          value={applications.length}
          icon="↗"
        />
      </section>

      <section
        className="career-toolbar"
        style={styles.toolbar}
      >
        <div
          className="career-search"
          style={styles.searchBox}
        >
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search positions..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          {[
            ["all", "All"],
            ["active", "Active"],
            ["inactive", "Inactive"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setStatusFilter(value)
              }
              style={{
                ...styles.filterButton,
                ...(statusFilter === value
                  ? styles.filterActive
                  : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <strong style={styles.tableTitle}>
              Job Openings
            </strong>

            <span style={styles.tableSubtitle}>
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1
                ? "position"
                : "positions"}
            </span>
          </div>

          <button
            type="button"
            onClick={onCreate}
            style={styles.smallCreate}
          >
            + Add Position
          </button>
        </div>

        {filteredJobs.length === 0 ? (
          <EmptyState
            search={search}
            onCreate={onCreate}
          />
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    POSITION
                  </th>

                  <th style={styles.th}>
                    DEPARTMENT
                  </th>

                  <th style={styles.th}>
                    LOCATION
                  </th>

                  <th style={styles.th}>
                    TYPE
                  </th>

                  <th
                    style={{
                      ...styles.th,
                      textAlign: "center",
                    }}
                  >
                    APPLICATIONS
                  </th>

                  <th
                    style={{
                      ...styles.th,
                      textAlign: "center",
                    }}
                  >
                    STATUS
                  </th>

                  <th
                    style={{
                      ...styles.th,
                      textAlign: "right",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map((job) => {
                  const count =
                    applications.filter(
                      (item) =>
                        item.job_id === job.id
                    ).length;

                  return (
                    <tr key={job.id}>
                      <td style={styles.td}>
                        <div style={styles.position}>
                          <div
                            style={
                              styles.positionIcon
                            }
                          >
                            {job.title
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "J"}
                          </div>

                          <div
                            style={
                              styles.positionText
                            }
                          >
                            <strong>
                              {job.title}
                            </strong>

                            <span>
                              /careers/
                              {job.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            styles.cellText
                          }
                        >
                          {job.department ||
                            "—"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            styles.cellText
                          }
                        >
                          {job.location ||
                            "—"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            styles.cellText
                          }
                        >
                          {job.employment_type ||
                            "—"}
                        </span>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={
                            onApplications
                          }
                          style={
                            styles.applicationCount
                          }
                        >
                          {count}
                        </button>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >
                        <StatusJobBadge
                          active={
                            job.is_active
                          }
                        />
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={
                            styles.actions
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(job)
                            }
                            style={
                              styles.iconButton
                            }
                            title="Edit"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onToggle(job)
                            }
                            style={
                              styles.iconButton
                            }
                            title={
                              job.is_active
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {job.is_active
                              ? "◌"
                              : "●"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onDelete(job)
                            }
                            style={{
                              ...styles.iconButton,
                              ...styles.deleteButton,
                            }}
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function ApplicationsView({
  applications,
  filteredApplications,
  jobs,
  jobMap,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  jobFilter,
  setJobFilter,
  newApplications,
  reviewingApplications,
  shortlistedApplications,
  hiredApplications,
  onOpen,
}) {
  return (
    <>
      <section
        className="career-stats-grid"
        style={styles.statsGrid}
      >
        <Stat
          label="Total Applications"
          value={applications.length}
          icon="↗"
        />

        <Stat
          label="New"
          value={newApplications}
          icon="!"
        />

        <Stat
          label="Reviewing"
          value={reviewingApplications}
          icon="◎"
        />

        <Stat
          label="Shortlisted"
          value={shortlistedApplications}
          icon="◆"
        />

        <Stat
          label="Hired"
          value={hiredApplications}
          icon="✓"
        />
      </section>

      <section style={styles.applicationToolbar}>
        <div
          className="career-search"
          style={styles.searchBox}
        >
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search applicants, email or position..."
            style={styles.searchInput}
          />
        </div>

        <select
          value={jobFilter}
          onChange={(event) =>
            setJobFilter(event.target.value)
          }
          style={styles.select}
        >
          <option value="all">
            All Positions
          </option>

          {jobs.map((job) => (
            <option
              key={job.id}
              value={job.id}
            >
              {job.title}
            </option>
          ))}
        </select>

        <div style={styles.filters}>
          {[
            ["all", "All"],
            ["new", "New"],
            ["reviewing", "Reviewing"],
            ["shortlisted", "Shortlisted"],
            ["rejected", "Rejected"],
            ["hired", "Hired"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setStatusFilter(value)
              }
              style={{
                ...styles.filterButton,
                ...(statusFilter === value
                  ? styles.filterActive
                  : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.applicationTableCard}>
        {filteredApplications.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              ↗
            </div>

            <h3>
              No applications found
            </h3>

            <p>
              Try changing your search or
              filters.
            </p>
          </div>
        ) : (
          <div style={styles.applicationList}>
            {filteredApplications.map(
              (application) => {
                const job =
                  jobMap[
                    application.job_id
                  ];

                return (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() =>
                      onOpen(application)
                    }
                    style={
                      styles.applicationRow
                    }
                  >
                    <div
                      style={
                        styles.appAvatar
                      }
                    >
                      {application.full_name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "?"}
                    </div>

                    <div
                      style={
                        styles.appIdentity
                      }
                    >
                      <strong>
                        {application.full_name}
                      </strong>

                      <span>
                        {application.email}
                      </span>
                    </div>

                    <div
                      style={
                        styles.applicationJob
                      }
                    >
                      <strong>
                        {job?.title ||
                          "Position removed"}
                      </strong>

                      <span>
                        {job?.department ||
                          "General"}
                      </span>
                    </div>

                    <div
                      style={
                        styles.applicationDate
                      }
                    >
                      {application.created_at
                        ? new Date(
                            application.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </div>

                    <StatusBadge
                      status={
                        application.status
                      }
                    />

                    <span
                      style={
                        styles.rowArrow
                      }
                    >
                      →
                    </span>
                  </button>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );
}

function JobEditor({
  form,
  editingJob,
  saving,
  onChange,
  onClose,
  onSave,
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalEyebrow}>
              {editingJob
                ? "EDIT POSITION"
                : "NEW POSITION"}
            </div>

            <h2 style={styles.modalTitle}>
              {editingJob
                ? "Edit Job Opening"
                : "Create Job Opening"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSave}>
          <div
            className="career-form-grid"
            style={styles.formGrid}
          >
            <Field
              label="Job Title"
              value={form.title}
              placeholder="Senior Full Stack Developer"
              required
              onChange={(value) => {
                onChange("title", value);

                if (!editingJob) {
                  onChange(
                    "slug",
                    slugify(value)
                  );
                }
              }}
            />

            <Field
              label="Slug"
              value={form.slug}
              placeholder="senior-full-stack-developer"
              required
              onChange={(value) =>
                onChange(
                  "slug",
                  slugify(value)
                )
              }
            />

            <Field
              label="Department"
              value={form.department}
              placeholder="Engineering"
              onChange={(value) =>
                onChange(
                  "department",
                  value
                )
              }
            />

            <Field
              label="Location"
              value={form.location}
              placeholder="Remote / Dubai / Kerala"
              onChange={(value) =>
                onChange(
                  "location",
                  value
                )
              }
            />

            <Field
              label="Employment Type"
              value={form.employment_type}
              placeholder="Full-time"
              onChange={(value) =>
                onChange(
                  "employment_type",
                  value
                )
              }
            />

            <div style={styles.field}>
              <label style={styles.label}>
                Status
              </label>

              <button
                type="button"
                onClick={() =>
                  onChange(
                    "is_active",
                    !form.is_active
                  )
                }
                style={{
                  ...styles.toggle,
                  ...(form.is_active
                    ? styles.toggleOn
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.toggleDot,
                    ...(form.is_active
                      ? styles.toggleDotOn
                      : {}),
                  }}
                />

                {form.is_active
                  ? "Active"
                  : "Inactive"}
              </button>
            </div>

            <div
              className="career-full-field"
              style={styles.fullField}
            >
              <label style={styles.label}>
                Job Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  onChange(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe the role, responsibilities and opportunity..."
                rows={7}
                style={styles.textarea}
              />
            </div>

            <div
              className="career-full-field"
              style={styles.fullField}
            >
              <label style={styles.label}>
                Requirements
              </label>

              <textarea
                value={form.requirements}
                onChange={(event) =>
                  onChange(
                    "requirements",
                    event.target.value
                  )
                }
                placeholder="Skills, experience, education and other requirements..."
                rows={7}
                style={styles.textarea}
              />
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.saveButton}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingJob
                ? "Update Position"
                : "Create Position"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplicationDrawer({
  application,
  job,
  updating,
  onClose,
  onStatusChange,
}) {
  return (
    <div style={styles.drawerOverlay}>
      <aside style={styles.drawer}>
        <div style={styles.drawerHeader}>
          <div>
            <div style={styles.modalEyebrow}>
              APPLICANT PROFILE
            </div>

            <h2 style={styles.drawerTitle}>
              {application.full_name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>

        <div style={styles.drawerBody}>
          <div style={styles.profileHero}>
            <div style={styles.largeAvatar}>
              {application.full_name
                ?.charAt(0)
                ?.toUpperCase() || "?"}
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                }}
              >
                {application.full_name}
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#8b93a6",
                  fontSize: 12,
                }}
              >
                {job?.title ||
                  "Position unavailable"}
              </p>
            </div>
          </div>

          <section style={styles.detailSection}>
            <div style={styles.detailLabel}>
              APPLICATION STATUS
            </div>

            <div style={styles.statusGrid}>
              {APPLICATION_STATUSES.map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updating}
                    onClick={() =>
                      onStatusChange(
                        application.id,
                        status
                      )
                    }
                    style={{
                      ...styles.statusOption,
                      ...(application.status ===
                      status
                        ? styles.statusOptionActive
                        : {}),
                    }}
                  >
                    <StatusBadge
                      status={status}
                    />
                  </button>
                )
              )}
            </div>
          </section>

          <section style={styles.detailSection}>
            <div style={styles.detailLabel}>
              CONTACT
            </div>

            <div style={styles.contactList}>
              <a
                href={`mailto:${application.email}`}
                style={styles.contactItem}
              >
                <span>✉</span>
                {application.email}
              </a>

              {application.phone && (
                <a
                  href={`tel:${application.phone}`}
                  style={styles.contactItem}
                >
                  <span>⌕</span>
                  {application.phone}
                </a>
              )}
            </div>
          </section>

          <section style={styles.detailSection}>
            <div style={styles.detailLabel}>
              POSITION
            </div>

            <div style={styles.jobDetail}>
              <strong>
                {job?.title ||
                  "Position unavailable"}
              </strong>

              <span>
                {job?.department ||
                  "Department not specified"}
              </span>

              <span>
                {job?.location ||
                  "Location not specified"}
              </span>
            </div>
          </section>

          <section style={styles.detailSection}>
            <div style={styles.detailLabel}>
              DOCUMENTS
            </div>

            <div style={styles.documentGrid}>
              {application.resume_url ? (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.document}
                >
                  <span>▣</span>
                  <strong>
                    Resume
                  </strong>
                  <small>
                    Open document →
                  </small>
                </a>
              ) : (
                <div
                  style={{
                    ...styles.document,
                    ...styles.documentDisabled,
                  }}
                >
                  <span>▣</span>
                  <strong>
                    No Resume
                  </strong>
                  <small>
                    Not provided
                  </small>
                </div>
              )}

              {application.portfolio_url ? (
                <a
                  href={application.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.document}
                >
                  <span>↗</span>
                  <strong>
                    Portfolio
                  </strong>
                  <small>
                    Open website →
                  </small>
                </a>
              ) : (
                <div
                  style={{
                    ...styles.document,
                    ...styles.documentDisabled,
                  }}
                >
                  <span>↗</span>
                  <strong>
                    No Portfolio
                  </strong>
                  <small>
                    Not provided
                  </small>
                </div>
              )}
            </div>
          </section>

          <section style={styles.detailSection}>
            <div style={styles.detailLabel}>
              COVER LETTER
            </div>

            <div style={styles.coverLetterLarge}>
              {application.cover_letter ? (
                <p
                  style={{
                    margin: 0,
                  }}
                >
                  {application.cover_letter}
                </p>
              ) : (
                <span>
                  No cover letter provided.
                </span>
              )}
            </div>
          </section>

          <section style={styles.detailSection}>
            <div style={styles.detailLabel}>
              APPLICATION DATE
            </div>

            <div style={styles.dateValue}>
              {application.created_at
                ? new Date(
                    application.created_at
                  ).toLocaleString()
                : "Unknown"}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function StatusBadge({ status }) {
  const labels = {
    new: "NEW",
    reviewing: "REVIEWING",
    shortlisted: "SHORTLISTED",
    rejected: "REJECTED",
    hired: "HIRED",
  };

  const statusStyle =
    status === "new"
      ? styles.appNew
      : status === "reviewing"
      ? styles.appReviewing
      : status === "shortlisted"
      ? styles.appShortlisted
      : status === "rejected"
      ? styles.appRejected
      : styles.appHired;

  return (
    <span
      style={{
        ...styles.appStatus,
        ...statusStyle,
      }}
    >
      {labels[status] || status}
    </span>
  );
}

function StatusJobBadge({ active }) {
  return (
    <span
      style={{
        ...styles.jobStatus,
        ...(active
          ? styles.jobStatusActive
          : styles.jobStatusInactive),
      }}
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  required,
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>
        {label}

        {required && (
          <span style={styles.required}>
            {" "}
            *
          </span>
        )}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        style={styles.input}
      />
    </label>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>
        <div style={styles.statLabel}>
          {label}
        </div>

        <div style={styles.statValue}>
          {value}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ search, onCreate }) {
  return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>
        ◈
      </div>

      <h3 style={{ margin: 0 }}>
        {search
          ? "No matching positions"
          : "No job openings yet"}
      </h3>

      <p style={styles.emptyText}>
        {search
          ? "Try a different search term or filter."
          : "Create your first job opening to start receiving applications."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          style={styles.primaryButton}
        >
          + Create Position
        </button>
      )}
    </div>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(47,127,255,.10), transparent 32%), #070a10",
    color: "#eceff5",
    padding: "32px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  shell: {
    maxWidth: 1550,
    margin: "0 auto",
  },

  eyebrow: {
    color: "#29e0ff",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: ".18em",
    marginBottom: 9,
  },

  title: {
    margin: 0,
    fontSize: "clamp(32px,4vw,48px)",
    letterSpacing: "-.045em",
    lineHeight: 1,
  },

  subtitle: {
    color: "#8b93a6",
    margin: "12px 0 0",
    fontSize: 14,
  },

  headerActions: {
    display: "flex",
    gap: 10,
  },

  primaryButton: {
    border: "1px solid rgba(47,127,255,.5)",
    background:
      "linear-gradient(135deg,#2f7fff,#29e0ff)",
    color: "#06101d",
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    border:
      "1px solid rgba(255,255,255,.10)",
    background:
      "rgba(255,255,255,.045)",
    color: "#c7cedc",
    padding: "12px 16px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },

  message: {
    display: "flex",
    gap: 9,
    alignItems: "center",
    padding: "12px 15px",
    borderRadius: 9,
    marginBottom: 16,
    fontSize: 13,
  },

  success: {
    background:
      "rgba(52,211,153,.08)",
    border:
      "1px solid rgba(52,211,153,.18)",
    color: "#8ef0c5",
  },

  error: {
    background:
      "rgba(248,113,113,.08)",
    border:
      "1px solid rgba(248,113,113,.18)",
    color: "#ffabab",
  },

  viewTabs: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 4,
    marginBottom: 18,
    borderRadius: 11,
    background:
      "rgba(255,255,255,.035)",
    border:
      "1px solid rgba(255,255,255,.08)",
  },

  viewTab: {
    appearance: "none",
    WebkitAppearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 38,
    border: "1px solid transparent",
    outline: "none",
    background: "transparent",
    color: "#8b93a6",
    padding: "8px 15px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 750,
    fontSize: 12,
    fontFamily: "inherit",
    lineHeight: 1,
  },

  viewTabActive: {
    background:
      "rgba(47,127,255,.13)",
    border:
      "1px solid rgba(47,127,255,.22)",
    color: "#8fc6ff",
  },

  tabCount: {
    minWidth: 19,
    height: 19,
    padding: "0 5px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    background:
      "rgba(255,255,255,.07)",
    color: "#aeb6c6",
    fontSize: 10,
    fontWeight: 800,
  },

  newBadge: {
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    background:
      "rgba(41,224,255,.13)",
    color: "#8feaff",
    fontSize: 9,
    fontWeight: 800,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",
    gap: 12,
    marginBottom: 18,
  },

  stat: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 17,
    borderRadius: 13,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.035)",
    minWidth: 0,
  },

  statIcon: {
    width: 40,
    height: 40,
    display: "grid",
    placeItems: "center",
    borderRadius: 10,
    background:
      "rgba(47,127,255,.11)",
    color: "#29e0ff",
    fontSize: 18,
    flexShrink: 0,
  },

  statLabel: {
    color: "#8b93a6",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: ".1em",
    fontWeight: 750,
  },

  statValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: 800,
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 14,
  },

  applicationToolbar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 14,
  },

  searchBox: {
    flex: 1,
    maxWidth: 560,
    minWidth: 250,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 13px",
    borderRadius: 10,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.035)",
    color: "#687185",
  },

  searchInput: {
    flex: 1,
    width: "100%",
    border: 0,
    outline: 0,
    background: "transparent",
    color: "#eceff5",
    padding: "12px 0",
    fontSize: 13,
    fontFamily: "inherit",
  },

  filters: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },

  filterButton: {
    appearance: "none",
    WebkitAppearance: "none",
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.03)",
    color: "#8b93a6",
    borderRadius: 8,
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "inherit",
  },

  filterActive: {
    background:
      "rgba(47,127,255,.12)",
    borderColor:
      "rgba(47,127,255,.25)",
    color: "#8fc6ff",
  },

  tableCard: {
    borderRadius: 15,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.025)",
    overflow: "hidden",
  },

  tableHeader: {
    minHeight: 66,
    padding: "15px 20px",
    borderBottom:
      "1px solid rgba(255,255,255,.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },

  tableTitle: {
    color: "#eceff5",
    fontSize: 14,
  },

  tableSubtitle: {
    color: "#687185",
    fontSize: 11,
    marginLeft: 9,
  },

  smallCreate: {
    appearance: "none",
    border:
      "1px solid rgba(47,127,255,.2)",
    background:
      "rgba(47,127,255,.07)",
    color: "#8fc6ff",
    padding: "8px 11px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 750,
    fontFamily: "inherit",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1080,
    tableLayout: "auto",
  },

  th: {
    textAlign: "left",
    padding: "13px 18px",
    color: "#687185",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".11em",
    borderBottom:
      "1px solid rgba(255,255,255,.06)",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px 18px",
    color: "#c7cedc",
    fontSize: 12,
    borderBottom:
      "1px solid rgba(255,255,255,.05)",
    verticalAlign: "middle",
  },

  position: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    minWidth: 240,
  },

  positionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background:
      "rgba(47,127,255,.1)",
    color: "#8fc6ff",
    fontWeight: 800,
    flexShrink: 0,
  },

  positionText: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },

  positionTextStrong: {
    color: "#eceff5",
  },

  cellText: {
    color: "#aeb6c6",
    whiteSpace: "nowrap",
  },

  applicationCount: {
    appearance: "none",
    minWidth: 31,
    height: 29,
    border: 0,
    background:
      "rgba(41,224,255,.07)",
    color: "#8feaff",
    borderRadius: 7,
    padding: "5px 9px",
    cursor: "pointer",
    fontWeight: 800,
    fontFamily: "inherit",
  },

  jobStatus: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    padding: "5px 8px",
    borderRadius: 6,
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: ".08em",
  },

  jobStatusActive: {
    background:
      "rgba(52,211,153,.08)",
    color: "#7ce6b6",
    border:
      "1px solid rgba(52,211,153,.14)",
  },

  jobStatusInactive: {
    background:
      "rgba(255,255,255,.05)",
    color: "#8b93a6",
    border:
      "1px solid rgba(255,255,255,.08)",
  },

  actions: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },

  iconButton: {
    appearance: "none",
    width: 32,
    height: 32,
    display: "grid",
    placeItems: "center",
    borderRadius: 7,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.035)",
    color: "#9da6b8",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  deleteButton: {
    color: "#ff8f8f",
  },

  empty: {
    padding: "70px 25px",
    textAlign: "center",
  },

  emptyIcon: {
    width: 54,
    height: 54,
    display: "grid",
    placeItems: "center",
    margin: "0 auto 15px",
    borderRadius: 15,
    background:
      "rgba(47,127,255,.09)",
    color: "#29e0ff",
    fontSize: 22,
  },

  emptyText: {
    color: "#687185",
    fontSize: 13,
    margin:
      "9px auto 20px",
    maxWidth: 450,
    lineHeight: 1.6,
  },

  select: {
    border:
      "1px solid rgba(255,255,255,.08)",
    background: "#0c111a",
    color: "#c7cedc",
    borderRadius: 9,
    padding: "10px 12px",
    outline: 0,
    fontSize: 12,
    fontFamily: "inherit",
  },

  applicationTableCard: {
    borderRadius: 15,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.025)",
    overflow: "hidden",
  },

  applicationList: {
    display: "flex",
    flexDirection: "column",
  },

  applicationRow: {
    appearance: "none",
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "44px minmax(180px,1.3fr) minmax(170px,1fr) 120px 120px 25px",
    alignItems: "center",
    gap: 14,
    padding: "15px 18px",
    border: 0,
    borderBottom:
      "1px solid rgba(255,255,255,.06)",
    background: "transparent",
    color: "#eceff5",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  appAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background:
      "rgba(47,127,255,.1)",
    color: "#8fc6ff",
    fontWeight: 800,
  },

  appIdentity: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },

  applicationJob: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },

  applicationDate: {
    color: "#687185",
    fontSize: 11,
  },

  rowArrow: {
    color: "#687185",
    fontSize: 18,
  },

  appStatus: {
    display: "inline-flex",
    width: "fit-content",
    padding: "5px 8px",
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },

  appNew: {
    color: "#8feaff",
    background:
      "rgba(41,224,255,.07)",
  },

  appReviewing: {
    color: "#8fc6ff",
    background:
      "rgba(47,127,255,.08)",
  },

  appShortlisted: {
    color: "#8ef0c5",
    background:
      "rgba(52,211,153,.08)",
  },

  appRejected: {
    color: "#ffabab",
    background:
      "rgba(248,113,113,.08)",
  },

  appHired: {
    color: "#d4b7ff",
    background:
      "rgba(167,139,250,.08)",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background:
      "rgba(0,0,0,.72)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "min(900px,100%)",
    maxHeight: "92vh",
    overflow: "auto",
    borderRadius: 17,
    border:
      "1px solid rgba(255,255,255,.10)",
    background: "#0b0f17",
    boxShadow:
      "0 30px 100px rgba(0,0,0,.5)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    padding: "22px 24px",
    borderBottom:
      "1px solid rgba(255,255,255,.07)",
  },

  modalEyebrow: {
    color: "#29e0ff",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".17em",
    marginBottom: 7,
  },

  modalTitle: {
    margin: 0,
    fontSize: 23,
    letterSpacing: "-.025em",
  },

  closeButton: {
    appearance: "none",
    width: 34,
    height: 34,
    borderRadius: 8,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.04)",
    color: "#8b93a6",
    fontSize: 21,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: 18,
    padding: 24,
  },

  fullField: {
    gridColumn: "1 / -1",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    color: "#c7cedc",
    fontSize: 12,
    fontWeight: 750,
  },

  required: {
    color: "#29e0ff",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: 9,
    border:
      "1px solid rgba(255,255,255,.09)",
    background:
      "rgba(0,0,0,.2)",
    color: "#eceff5",
    outline: "none",
    fontSize: 13,
    fontFamily: "inherit",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    padding: "12px 13px",
    borderRadius: 9,
    border:
      "1px solid rgba(255,255,255,.09)",
    background:
      "rgba(0,0,0,.2)",
    color: "#eceff5",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.65,
  },

  toggle: {
    height: 42,
    borderRadius: 9,
    border:
      "1px solid rgba(255,255,255,.09)",
    background:
      "rgba(255,255,255,.035)",
    color: "#8b93a6",
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "0 13px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },

  toggleOn: {
    background:
      "rgba(47,127,255,.10)",
    borderColor:
      "rgba(47,127,255,.22)",
    color: "#8fc6ff",
  },

  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#687185",
  },

  toggleDotOn: {
    background: "#29e0ff",
    boxShadow:
      "0 0 10px rgba(41,224,255,.5)",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "17px 24px",
    borderTop:
      "1px solid rgba(255,255,255,.07)",
  },

  cancelButton: {
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.035)",
    color: "#8b93a6",
    padding: "11px 16px",
    borderRadius: 9,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  saveButton: {
    border:
      "1px solid rgba(47,127,255,.45)",
    background:
      "linear-gradient(135deg,#2f7fff,#29e0ff)",
    color: "#06101d",
    padding: "11px 17px",
    borderRadius: 9,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  drawerOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1100,
    background:
      "rgba(0,0,0,.65)",
    backdropFilter: "blur(7px)",
  },

  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "min(560px,100%)",
    background: "#0b0f17",
    borderLeft:
      "1px solid rgba(255,255,255,.09)",
    boxShadow:
      "-25px 0 80px rgba(0,0,0,.45)",
    display: "flex",
    flexDirection: "column",
  },

  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    padding: "22px 24px",
    borderBottom:
      "1px solid rgba(255,255,255,.07)",
  },

  drawerTitle: {
    margin: 0,
    fontSize: 24,
    letterSpacing: "-.025em",
  },

  drawerBody: {
    flex: 1,
    overflowY: "auto",
    padding: 24,
  },

  profileHero: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    paddingBottom: 24,
    borderBottom:
      "1px solid rgba(255,255,255,.07)",
  },

  largeAvatar: {
    width: 58,
    height: 58,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg,rgba(47,127,255,.22),rgba(41,224,255,.12))",
    color: "#8feaff",
    fontSize: 21,
    fontWeight: 850,
  },

  detailSection: {
    padding: "22px 0",
    borderBottom:
      "1px solid rgba(255,255,255,.07)",
  },

  detailLabel: {
    color: "#687185",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".16em",
    marginBottom: 12,
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: 7,
  },

  statusOption: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    border:
      "1px solid rgba(255,255,255,.07)",
    background:
      "rgba(255,255,255,.025)",
    padding: 9,
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  statusOptionActive: {
    borderColor:
      "rgba(47,127,255,.35)",
    background:
      "rgba(47,127,255,.09)",
  },

  contactList: {
    display: "grid",
    gap: 8,
  },

  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 12px",
    borderRadius: 8,
    background:
      "rgba(255,255,255,.025)",
    color: "#8fc6ff",
    textDecoration: "none",
    fontSize: 13,
  },

  jobDetail: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#8b93a6",
    fontSize: 12,
  },

  documentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: 9,
  },

  document: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: 14,
    borderRadius: 10,
    border:
      "1px solid rgba(47,127,255,.16)",
    background:
      "rgba(47,127,255,.055)",
    color: "#8fc6ff",
    textDecoration: "none",
  },

  documentDisabled: {
    opacity: 0.45,
    borderColor:
      "rgba(255,255,255,.07)",
    background:
      "rgba(255,255,255,.025)",
    color: "#8b93a6",
  },

  coverLetterLarge: {
    padding: 15,
    borderRadius: 10,
    background:
      "rgba(255,255,255,.025)",
    color: "#c7cedc",
    fontSize: 13,
    lineHeight: 1.75,
  },

  dateValue: {
    color: "#c7cedc",
    fontSize: 13,
  },

  loading: {
    minHeight: "70vh",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    color: "#8b93a6",
  },

  spinner: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border:
      "3px solid rgba(255,255,255,.08)",
    borderTopColor: "#29e0ff",
  },
};