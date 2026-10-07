"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

const DEFAULT_SETTINGS = {
  general: {
    site_name: "CEVTEXA",
    tagline: "Digital Systems That Think Ahead.",
    description: "",
  },

  contact: {
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    country: "India",
  },

  branding: {
    logo_url: "",
    favicon_url: "",
    og_image_url: "",
  },

  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    twitter: "",
    github: "",
  },

  website: {
    maintenance_mode: false,
    analytics_id: "",
    google_maps_url: "",
    default_language: "en",
  },
};

const TABS = [
  {
    id: "general",
    label: "General",
    icon: "◈",
  },
  {
    id: "contact",
    label: "Contact",
    icon: "⌕",
  },
  {
    id: "branding",
    label: "Branding",
    icon: "◆",
  },
  {
    id: "social",
    label: "Social",
    icon: "◎",
  },
  {
    id: "website",
    label: "Website",
    icon: "⚙",
  },
];

export default function SettingsAdminPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState(
    cloneDefaultSettings()
  );

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  function cloneDefaultSettings() {
    return JSON.parse(
      JSON.stringify(DEFAULT_SETTINGS)
    );
  }

  async function checkAuth() {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile, error } =
        await supabase
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

      await loadSettings();
    } catch (error) {
      console.error("Authentication error:", error);
      router.replace("/admin/login");
    }
  }

  async function loadSettings() {
    setLoading(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "id, setting_key, setting_value, updated_at"
        )
        .order("setting_key", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const nextSettings = cloneDefaultSettings();

      (data || []).forEach((row) => {
        if (
          Object.prototype.hasOwnProperty.call(
            nextSettings,
            row.setting_key
          )
        ) {
          const value = row.setting_value;

          if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
          ) {
            nextSettings[row.setting_key] = {
              ...nextSettings[row.setting_key],
              ...value,
            };
          }
        }
      });

      setSettings(nextSettings);
    } catch (error) {
      console.error("Settings load error:", error);

      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to load website settings.",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateSetting(
    section,
    field,
    value
  ) {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    setMessage({
      type: "",
      text: "",
    });
  }

  async function saveAllSettings() {
    if (saving) {
      return;
    }

    setSaving(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const sections = Object.entries(settings);

      for (const [settingKey, settingValue] of sections) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(
            {
              setting_key: settingKey,
              setting_value: settingValue,
            },
            {
              onConflict: "setting_key",
            }
          );

        if (error) {
          throw error;
        }
      }

      setMessage({
        type: "success",
        text: "Website settings saved successfully.",
      });
    } catch (error) {
      console.error("Settings save error:", error);

      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to save website settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  function resetCurrentSection() {
    const confirmed = window.confirm(
      "Reset this section to its default values?"
    );

    if (!confirmed) {
      return;
    }

    setSettings((current) => ({
      ...current,
      [activeTab]: JSON.parse(
        JSON.stringify(DEFAULT_SETTINGS[activeTab])
      ),
    }));

    setMessage({
      type: "success",
      text:
        "Section reset. Click Save Changes to apply it.",
    });
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p>Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header className="settings-header">
          <div>
            <div style={styles.eyebrow}>
              SYSTEM CONTROL
            </div>

            <h1 style={styles.title}>
              Settings
            </h1>

            <p style={styles.subtitle}>
              Control the core information and
              configuration of your CEVTEXA website.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={loadSettings}
              style={styles.secondaryButton}
              disabled={saving}
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              onClick={saveAllSettings}
              style={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
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

            <span>{message.text}</span>
          </div>
        )}

        <section className="settings-layout">
          <aside style={styles.sidebar}>
            <div style={styles.sidebarLabel}>
              CONFIGURATION
            </div>

            <div style={styles.tabs}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.id
                      ? styles.tabActive
                      : {}),
                  }}
                >
                  <span style={styles.tabIcon}>
                    {tab.icon}
                  </span>

                  <span>{tab.label}</span>

                  {activeTab === tab.id && (
                    <span
                      style={styles.tabIndicator}
                    />
                  )}
                </button>
              ))}
            </div>

            <div style={styles.sidebarBottom}>
              <div style={styles.systemCard}>
                <div style={styles.systemDot} />

                <div
                  style={
                    styles.systemCardText
                  }
                >
                  <strong>
                    System Online
                  </strong>

                  <span>
                    Configuration storage
                    connected
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <section style={styles.content}>
            {activeTab === "general" && (
              <GeneralSettings
                settings={settings.general}
                onChange={(field, value) =>
                  updateSetting(
                    "general",
                    field,
                    value
                  )
                }
              />
            )}

            {activeTab === "contact" && (
              <ContactSettings
                settings={settings.contact}
                onChange={(field, value) =>
                  updateSetting(
                    "contact",
                    field,
                    value
                  )
                }
              />
            )}

            {activeTab === "branding" && (
              <BrandingSettings
                settings={settings.branding}
                onChange={(field, value) =>
                  updateSetting(
                    "branding",
                    field,
                    value
                  )
                }
              />
            )}

            {activeTab === "social" && (
              <SocialSettings
                settings={settings.social}
                onChange={(field, value) =>
                  updateSetting(
                    "social",
                    field,
                    value
                  )
                }
              />
            )}

            {activeTab === "website" && (
              <WebsiteSettings
                settings={settings.website}
                onChange={(field, value) =>
                  updateSetting(
                    "website",
                    field,
                    value
                  )
                }
              />
            )}

            <div style={styles.contentFooter}>
              <button
                type="button"
                onClick={resetCurrentSection}
                style={styles.resetButton}
                disabled={saving}
              >
                Reset Section
              </button>

              <button
                type="button"
                onClick={saveAllSettings}
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </section>
        </section>
      </div>

      <style jsx>{`
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 24px;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 235px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .settings-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 760px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            position: static !important;
          }
        }

        @media (max-width: 520px) {
          .settings-header-actions {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function GeneralSettings({
  settings,
  onChange,
}) {
  return (
    <SettingsSection
      eyebrow="GENERAL"
      title="General Information"
      description="Basic identity information used throughout the CEVTEXA website."
    >
      <div className="form-grid">
        <Field
          label="Website Name"
          value={settings.site_name}
          placeholder="CEVTEXA"
          onChange={(value) =>
            onChange("site_name", value)
          }
        />

        <Field
          label="Tagline"
          value={settings.tagline}
          placeholder="Digital Systems That Think Ahead."
          onChange={(value) =>
            onChange("tagline", value)
          }
        />

        <TextAreaField
          full
          label="Website Description"
          value={settings.description}
          placeholder="Short description about CEVTEXA..."
          rows={6}
          onChange={(value) =>
            onChange("description", value)
          }
        />
      </div>

      <FormHint>
        Keep the tagline short. It may be used in
        headers, metadata and social previews.
      </FormHint>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        @media (max-width: 650px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </SettingsSection>
  );
}

function ContactSettings({
  settings,
  onChange,
}) {
  return (
    <SettingsSection
      eyebrow="CONTACT"
      title="Contact Information"
      description="The primary contact details visitors can use to reach CEVTEXA."
    >
      <div className="form-grid">
        <Field
          label="Business Email"
          type="email"
          value={settings.email}
          placeholder="hello@cevtexa.com"
          onChange={(value) =>
            onChange("email", value)
          }
        />

        <Field
          label="Phone"
          value={settings.phone}
          placeholder="+91 XXXXX XXXXX"
          onChange={(value) =>
            onChange("phone", value)
          }
        />

        <Field
          label="WhatsApp Number"
          value={settings.whatsapp}
          placeholder="+91XXXXXXXXXX"
          onChange={(value) =>
            onChange("whatsapp", value)
          }
        />

        <Field
          label="City"
          value={settings.city}
          placeholder="Kozhikode"
          onChange={(value) =>
            onChange("city", value)
          }
        />

        <Field
          label="Country"
          value={settings.country}
          placeholder="India"
          onChange={(value) =>
            onChange("country", value)
          }
        />

        <TextAreaField
          label="Business Address"
          value={settings.address}
          placeholder="Enter your complete business address..."
          rows={4}
          onChange={(value) =>
            onChange("address", value)
          }
        />
      </div>

      <FormHint>
        Store WhatsApp with the country code when
        possible, for example +91XXXXXXXXXX.
      </FormHint>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        @media (max-width: 650px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </SettingsSection>
  );
}

function BrandingSettings({
  settings,
  onChange,
}) {
  return (
    <SettingsSection
      eyebrow="BRAND SYSTEM"
      title="Branding"
      description="Manage the visual assets used by the website and social previews."
    >
      <div style={styles.brandPreview}>
        <div style={styles.previewLogo}>
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt="CEVTEXA logo preview"
              style={styles.logoImage}
            />
          ) : (
            <span>CEVTEXA</span>
          )}
        </div>

        <div>
          <div style={styles.previewLabel}>
            LOGO PREVIEW
          </div>

          <p style={styles.previewText}>
            {settings.logo_url
              ? "Configured logo preview."
              : "Add a logo URL below to preview it."}
          </p>
        </div>
      </div>

      <div className="form-grid">
        <Field
          label="Logo URL"
          value={settings.logo_url}
          placeholder="https://..."
          onChange={(value) =>
            onChange("logo_url", value)
          }
        />

        <Field
          label="Favicon URL"
          value={settings.favicon_url}
          placeholder="https://..."
          onChange={(value) =>
            onChange(
              "favicon_url",
              value
            )
          }
        />

        <div className="full-field">
          <Field
            label="Open Graph Image URL"
            value={settings.og_image_url}
            placeholder="https://..."
            onChange={(value) =>
              onChange(
                "og_image_url",
                value
              )
            }
          />
        </div>
      </div>

      <FormHint>
        These fields store publicly accessible image
        URLs and can later be connected to your Media
        Management system.
      </FormHint>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        .full-field {
          grid-column: 1 / -1;
        }

        @media (max-width: 650px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .full-field {
            grid-column: auto;
          }
        }
      `}</style>
    </SettingsSection>
  );
}

function SocialSettings({
  settings,
  onChange,
}) {
  return (
    <SettingsSection
      eyebrow="SOCIAL PRESENCE"
      title="Social Media"
      description="Connect the official CEVTEXA social profiles displayed across the website."
    >
      <div className="social-grid">
        <SocialField
          label="Instagram"
          value={settings.instagram}
          placeholder="https://instagram.com/..."
          icon="◎"
          onChange={(value) =>
            onChange(
              "instagram",
              value
            )
          }
        />

        <SocialField
          label="Facebook"
          value={settings.facebook}
          placeholder="https://facebook.com/..."
          icon="f"
          onChange={(value) =>
            onChange(
              "facebook",
              value
            )
          }
        />

        <SocialField
          label="LinkedIn"
          value={settings.linkedin}
          placeholder="https://linkedin.com/company/..."
          icon="in"
          onChange={(value) =>
            onChange(
              "linkedin",
              value
            )
          }
        />

        <SocialField
          label="YouTube"
          value={settings.youtube}
          placeholder="https://youtube.com/..."
          icon="▶"
          onChange={(value) =>
            onChange(
              "youtube",
              value
            )
          }
        />

        <SocialField
          label="X / Twitter"
          value={settings.twitter}
          placeholder="https://x.com/..."
          icon="𝕏"
          onChange={(value) =>
            onChange(
              "twitter",
              value
            )
          }
        />

        <SocialField
          label="GitHub"
          value={settings.github}
          placeholder="https://github.com/..."
          icon="◉"
          onChange={(value) =>
            onChange(
              "github",
              value
            )
          }
        />
      </div>

      <FormHint>
        These URLs can later be connected to the
        global website footer and social buttons.
      </FormHint>

      <style jsx>{`
        .social-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        @media (max-width: 650px) {
          .social-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </SettingsSection>
  );
}

function WebsiteSettings({
  settings,
  onChange,
}) {
  return (
    <SettingsSection
      eyebrow="WEBSITE SYSTEM"
      title="Website Configuration"
      description="Control operational website settings and integrations."
    >
      <div style={styles.warningCard}>
        <div style={styles.warningIcon}>
          !
        </div>

        <div style={styles.warningContent}>
          <strong style={styles.warningTitle}>
            Maintenance Mode
          </strong>

          <p style={styles.warningText}>
            When enabled, the setting is stored for
            the website. The public maintenance
            experience will be wired into the public
            site during the production pass.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange(
              "maintenance_mode",
              !settings.maintenance_mode
            )
          }
          style={{
            ...styles.toggle,
            ...(settings.maintenance_mode
              ? styles.toggleOn
              : {}),
          }}
          aria-pressed={
            settings.maintenance_mode
          }
        >
          <span
            style={{
              ...styles.toggleDot,
              ...(settings.maintenance_mode
                ? styles.toggleDotOn
                : {}),
            }}
          />

          {settings.maintenance_mode
            ? "ON"
            : "OFF"}
        </button>
      </div>

      <div className="form-grid">
        <Field
          label="Analytics ID"
          value={settings.analytics_id}
          placeholder="G-XXXXXXXXXX"
          onChange={(value) =>
            onChange(
              "analytics_id",
              value
            )
          }
        />

        <Field
          label="Default Language"
          value={settings.default_language}
          placeholder="en"
          onChange={(value) =>
            onChange(
              "default_language",
              value
            )
          }
        />

        <div className="full-field">
          <Field
            label="Google Maps URL"
            value={settings.google_maps_url}
            placeholder="https://maps.google.com/..."
            onChange={(value) =>
              onChange(
                "google_maps_url",
                value
              )
            }
          />
        </div>
      </div>

      <div style={styles.systemInfo}>
        <div style={styles.systemInfoItem}>
          <span>Framework</span>
          <strong>Next.js</strong>
        </div>

        <div style={styles.systemInfoItem}>
          <span>Database</span>
          <strong>Supabase</strong>
        </div>

        <div style={styles.systemInfoItem}>
          <span>Environment</span>
          <strong>Production Ready</strong>
        </div>
      </div>

      <FormHint>
        Analytics ID is stored for future analytics
        integration. This screen does not inject an
        analytics script automatically.
      </FormHint>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
          margin-top: 22px;
        }

        .full-field {
          grid-column: 1 / -1;
        }

        @media (max-width: 650px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .full-field {
            grid-column: auto;
          }
        }
      `}</style>
    </SettingsSection>
  );
}

function SettingsSection({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionEyebrow}>
            {eyebrow}
          </div>

          <h2 style={styles.sectionTitle}>
            {title}
          </h2>

          <p style={styles.sectionDescription}>
            {description}
          </p>
        </div>
      </div>

      <div style={styles.settingsCard}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>
        {label}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
  rows = 5,
  full = false,
}) {
  return (
    <label
      style={{
        ...styles.field,
        ...(full
          ? styles.fullField
          : {}),
      }}
    >
      <span style={styles.label}>
        {label}
      </span>

      <textarea
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        style={styles.textarea}
      />
    </label>
  );
}

function SocialField({
  label,
  value,
  placeholder,
  icon,
  onChange,
}) {
  return (
    <label style={styles.socialField}>
      <div style={styles.socialIcon}>
        {icon}
      </div>

      <div style={styles.socialInputWrap}>
        <span style={styles.label}>
          {label}
        </span>

        <input
          type="url"
          value={value || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          style={styles.socialInput}
        />
      </div>
    </label>
  );
}

function FormHint({ children }) {
  return (
    <div style={styles.hint}>
      <span style={styles.hintIcon}>
        i
      </span>

      <p style={styles.hintText}>
        {children}
      </p>
    </div>
  );
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
    boxSizing: "border-box",
  },

  shell: {
    maxWidth: 1450,
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
    fontSize:
      "clamp(32px,4vw,48px)",
    letterSpacing: "-.045em",
    lineHeight: 1,
  },

  subtitle: {
    color: "#8b93a6",
    margin: "12px 0 0",
    fontSize: 14,
    maxWidth: 650,
    lineHeight: 1.6,
  },

  headerActions: {
    display: "flex",
    gap: 10,
  },

  primaryButton: {
    appearance: "none",
    border:
      "1px solid rgba(47,127,255,.5)",
    background:
      "linear-gradient(135deg,#2f7fff,#29e0ff)",
    color: "#06101d",
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  secondaryButton: {
    appearance: "none",
    border:
      "1px solid rgba(255,255,255,.10)",
    background:
      "rgba(255,255,255,.045)",
    color: "#c7cedc",
    padding: "12px 16px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  message: {
    display: "flex",
    gap: 9,
    alignItems: "center",
    padding: "12px 15px",
    borderRadius: 9,
    marginBottom: 18,
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

  sidebar: {
    position: "sticky",
    top: 20,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.025)",
    borderRadius: 15,
    overflow: "hidden",
  },

  sidebarLabel: {
    padding:
      "17px 18px 10px",
    color: "#687185",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".16em",
  },

  tabs: {
    display: "flex",
    flexDirection: "column",
    padding: "5px 9px 12px",
    gap: 3,
  },

  tab: {
    appearance: "none",
    WebkitAppearance: "none",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 11,
    width: "100%",
    border:
      "1px solid transparent",
    background: "transparent",
    color: "#8b93a6",
    padding: "12px 11px",
    borderRadius: 9,
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "inherit",
  },

  tabActive: {
    background:
      "rgba(47,127,255,.10)",
    border:
      "1px solid rgba(47,127,255,.18)",
    color: "#8fc6ff",
  },

  tabIcon: {
    width: 28,
    height: 28,
    display: "grid",
    placeItems: "center",
    borderRadius: 7,
    background:
      "rgba(255,255,255,.035)",
    color: "#687185",
    fontSize: 12,
    flexShrink: 0,
  },

  tabIndicator: {
    width: 4,
    height: 20,
    borderRadius: 999,
    background:
      "linear-gradient(#2f7fff,#29e0ff)",
    position: "absolute",
    right: 7,
  },

  sidebarBottom: {
    padding: 12,
    borderTop:
      "1px solid rgba(255,255,255,.06)",
  },

  systemCard: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: 11,
    borderRadius: 9,
    background:
      "rgba(52,211,153,.045)",
    border:
      "1px solid rgba(52,211,153,.08)",
  },

  systemDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#52d99a",
    boxShadow:
      "0 0 9px rgba(52,211,153,.55)",
    flexShrink: 0,
  },

  systemCardText: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },

  content: {
    minWidth: 0,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: "#29e0ff",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".16em",
    marginBottom: 7,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 25,
    letterSpacing: "-.03em",
  },

  sectionDescription: {
    color: "#8b93a6",
    margin: "8px 0 0",
    fontSize: 13,
    lineHeight: 1.6,
  },

  settingsCard: {
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.025)",
    borderRadius: 15,
    padding: 24,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  },

  fullField: {
    gridColumn: "1 / -1",
  },

  label: {
    color: "#c7cedc",
    fontSize: 11,
    fontWeight: 750,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    height: 44,
    padding: "0 13px",
    borderRadius: 9,
    border:
      "1px solid rgba(255,255,255,.09)",
    background:
      "rgba(0,0,0,.18)",
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
      "rgba(0,0,0,.18)",
    color: "#eceff5",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.65,
  },

  hint: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 18,
    padding: 12,
    borderRadius: 9,
    background:
      "rgba(47,127,255,.045)",
    border:
      "1px solid rgba(47,127,255,.08)",
    color: "#8b93a6",
  },

  hintIcon: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background:
      "rgba(47,127,255,.13)",
    color: "#8fc6ff",
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
  },

  hintText: {
    margin: 0,
    fontSize: 11,
    lineHeight: 1.6,
  },

  brandPreview: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: 15,
    marginBottom: 22,
    borderRadius: 11,
    background:
      "rgba(255,255,255,.025)",
    border:
      "1px solid rgba(255,255,255,.06)",
  },

  previewLogo: {
    width: 72,
    height: 72,
    borderRadius: 13,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,rgba(47,127,255,.14),rgba(41,224,255,.08))",
    border:
      "1px solid rgba(47,127,255,.14)",
    color: "#eceff5",
    fontWeight: 900,
    fontSize: 10,
    flexShrink: 0,
  },

  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: 9,
  },

  previewLabel: {
    color: "#687185",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".13em",
  },

  previewText: {
    margin: "5px 0 0",
    color: "#8b93a6",
    fontSize: 11,
  },

  socialField: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    minWidth: 0,
  },

  socialIcon: {
    width: 40,
    height: 40,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: 9,
    background:
      "rgba(47,127,255,.08)",
    color: "#8fc6ff",
    fontSize: 12,
    fontWeight: 800,
  },

  socialInputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    flex: 1,
    minWidth: 0,
  },

  socialInput: {
    width: "100%",
    boxSizing: "border-box",
    height: 40,
    padding: "0 12px",
    borderRadius: 8,
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(0,0,0,.18)",
    color: "#eceff5",
    outline: "none",
    fontSize: 12,
    fontFamily: "inherit",
  },

  warningCard: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: 15,
    borderRadius: 11,
    border:
      "1px solid rgba(245,158,11,.15)",
    background:
      "rgba(245,158,11,.045)",
  },

  warningIcon: {
    width: 36,
    height: 36,
    display: "grid",
    placeItems: "center",
    borderRadius: 9,
    background:
      "rgba(245,158,11,.10)",
    color: "#f4bd55",
    fontWeight: 900,
    flexShrink: 0,
  },

  warningContent: {
    minWidth: 0,
    flex: 1,
  },

  warningTitle: {
    fontSize: 12,
  },

  warningText: {
    margin: "5px 0 0",
    color: "#8b93a6",
    fontSize: 11,
    lineHeight: 1.5,
  },

  toggle: {
    minWidth: 70,
    height: 36,
    borderRadius: 999,
    border:
      "1px solid rgba(255,255,255,.09)",
    background:
      "rgba(255,255,255,.035)",
    color: "#8b93a6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "0 11px",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 800,
    fontFamily: "inherit",
    flexShrink: 0,
  },

  toggleOn: {
    background:
      "rgba(52,211,153,.09)",
    borderColor:
      "rgba(52,211,153,.18)",
    color: "#8ef0c5",
  },

  toggleDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#687185",
  },

  toggleDotOn: {
    background: "#52d99a",
    boxShadow:
      "0 0 8px rgba(52,211,153,.5)",
  },

  systemInfo: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3,minmax(0,1fr))",
    gap: 10,
    marginTop: 22,
  },

  systemInfoItem: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: 13,
    borderRadius: 9,
    background:
      "rgba(255,255,255,.025)",
    border:
      "1px solid rgba(255,255,255,.06)",
  },

  contentFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },

  resetButton: {
    appearance: "none",
    border:
      "1px solid rgba(255,255,255,.08)",
    background:
      "rgba(255,255,255,.025)",
    color: "#8b93a6",
    padding: "11px 15px",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "inherit",
  },

  loading: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#8b93a6",
    gap: 12,
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