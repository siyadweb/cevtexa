"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        const supabase = getSupabaseClient();

        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!mounted) return;

        if (data?.session) {
          setReady(true);
        } else {
          setError(
            "This password reset link is invalid or has expired. Please request a new reset link."
          );
        }
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.message ||
            "Unable to verify the password reset session."
        );
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    }

    checkRecoverySession();

    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN"
      ) {
        if (session) {
          setReady(true);
          setError("");
          setChecking(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function validatePassword(value) {
    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const passwordError = validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const supabase = getSupabaseClient();

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/admin");
      }, 1800);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update your password. Please request a new reset link."
      );
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <main className="reset-page">
        <div className="background-glow glow-one" />
        <div className="background-glow glow-two" />

        <section className="reset-card loading-card">
          <div className="brand">
            <div className="brand-mark">C</div>

            <div>
              <div className="brand-name">CEVTEXA</div>
              <div className="brand-subtitle">
                ADMIN SYSTEM
              </div>
            </div>
          </div>

          <div className="loader" />

          <h1>Verifying reset link</h1>

          <p>
            Please wait while we securely verify your password
            recovery session.
          </p>
        </section>

        <div className="footer">
          © {new Date().getFullYear()} CEVTEXA · Secure Admin Access
        </div>

        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="reset-page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <section className="reset-card">
        <div className="brand">
          <div className="brand-mark">C</div>

          <div>
            <div className="brand-name">CEVTEXA</div>
            <div className="brand-subtitle">
              ADMIN SYSTEM
            </div>
          </div>
        </div>

        <div className="icon-wrap">
          <span>✓</span>
        </div>

        <h1>Create new password</h1>

        <p className="description">
          Choose a strong new password for your CEVTEXA admin
          account.
        </p>

        {!ready && error ? (
          <>
            <div className="alert error">
              <span>!</span>
              <div>{error}</div>
            </div>

            <Link
              href="/admin/forgot-password"
              className="primary-link"
            >
              Request a new reset link
              <span>→</span>
            </Link>

            <Link
              href="/admin/login"
              className="back-link"
            >
              <span>←</span>
              Back to admin login
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="password">
              New password
            </label>

            <div className="input-wrap">
              <span className="input-icon">●</span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                autoComplete="new-password"
              />

              <button
                type="button"
                className="eye-button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "◉" : "○"}
              </button>
            </div>

            <label htmlFor="confirmPassword">
              Confirm new password
            </label>

            <div className="input-wrap">
              <span className="input-icon">●</span>

              <input
                id="confirmPassword"
                type={
                  showConfirm ? "text" : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                autoComplete="new-password"
              />

              <button
                type="button"
                className="eye-button"
                onClick={() =>
                  setShowConfirm((value) => !value)
                }
                aria-label={
                  showConfirm
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirm ? "◉" : "○"}
              </button>
            </div>

            <div className="requirements">
              <strong>Password requirements</strong>

              <div
                className={
                  password.length >= 8
                    ? "requirement valid"
                    : "requirement"
                }
              >
                <span>
                  {password.length >= 8 ? "✓" : "○"}
                </span>
                At least 8 characters
              </div>

              <div
                className={
                  /[A-Z]/.test(password)
                    ? "requirement valid"
                    : "requirement"
                }
              >
                <span>
                  {/[A-Z]/.test(password) ? "✓" : "○"}
                </span>
                One uppercase letter
              </div>

              <div
                className={
                  /[a-z]/.test(password)
                    ? "requirement valid"
                    : "requirement"
                }
              >
                <span>
                  {/[a-z]/.test(password) ? "✓" : "○"}
                </span>
                One lowercase letter
              </div>

              <div
                className={
                  /[0-9]/.test(password)
                    ? "requirement valid"
                    : "requirement"
                }
              >
                <span>
                  {/[0-9]/.test(password) ? "✓" : "○"}
                </span>
                One number
              </div>
            </div>

            {error && (
              <div className="alert error">
                <span>!</span>
                <div>{error}</div>
              </div>
            )}

            {message && (
              <div className="alert success">
                <span>✓</span>
                <div>{message}</div>
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={saving || Boolean(message)}
            >
              {saving ? (
                <>
                  <span className="spinner" />
                  Updating password...
                </>
              ) : (
                <>
                  Update password
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="security-note">
          <span>🔒</span>

          <div>
            <strong>Secure password recovery</strong>

            <p>
              Your new password is securely handled through
              Supabase Authentication.
            </p>
          </div>
        </div>
      </section>

      <div className="footer">
        © {new Date().getFullYear()} CEVTEXA · Secure Admin Access
      </div>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .reset-page {
    min-height: 100vh;
    background:
      radial-gradient(
        circle at 15% 15%,
        rgba(47, 127, 255, 0.13),
        transparent 30%
      ),
      radial-gradient(
        circle at 85% 80%,
        rgba(41, 224, 255, 0.09),
        transparent 30%
      ),
      #070a10;
    color: #eceff5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 32px 20px 70px;
    position: relative;
    overflow: hidden;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .background-glow {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
  }

  .glow-one {
    background: rgba(47, 127, 255, 0.07);
    top: -180px;
    left: -160px;
  }

  .glow-two {
    background: rgba(41, 224, 255, 0.05);
    right: -180px;
    bottom: -180px;
  }

  .reset-card {
    width: 100%;
    max-width: 470px;
    padding: 42px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(12, 16, 24, 0.88);
    backdrop-filter: blur(22px);
    border-radius: 24px;
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.035);
    position: relative;
    z-index: 2;
  }

  .loading-card {
    text-align: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 38px;
  }

  .loading-card .brand {
    text-align: left;
  }

  .brand-mark {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #2f7fff, #29e0ff);
    color: white;
    font-weight: 800;
    font-size: 20px;
    box-shadow: 0 8px 25px rgba(47, 127, 255, 0.22);
  }

  .brand-name {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .brand-subtitle {
    color: #8b93a6;
    font-size: 9px;
    letter-spacing: 0.18em;
    margin-top: 3px;
  }

  .icon-wrap {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    border: 1px solid rgba(47, 127, 255, 0.25);
    background: rgba(47, 127, 255, 0.08);
    color: #8fc6ff;
    font-size: 21px;
    margin-bottom: 22px;
  }

  h1 {
    margin: 0;
    font-size: clamp(28px, 5vw, 34px);
    line-height: 1.1;
    letter-spacing: -0.035em;
  }

  .description {
    margin: 14px 0 30px;
    color: #8b93a6;
    line-height: 1.7;
    font-size: 14px;
  }

  .loading-card h1 {
    margin-top: 10px;
  }

  .loading-card p {
    color: #8b93a6;
    font-size: 13px;
    line-height: 1.7;
  }

  .loader {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #2f7fff;
    border-right-color: #29e0ff;
    animation: spin 0.8s linear infinite;
    margin: 5px auto 25px;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 12px;
    font-weight: 700;
    color: #c7cedc;
    margin-bottom: 9px;
  }

  label:not(:first-child) {
    margin-top: 18px;
  }

  .input-wrap {
    height: 54px;
    display: flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.035);
    border-radius: 12px;
    transition: 0.2s ease;
  }

  .input-wrap:focus-within {
    border-color: rgba(47, 127, 255, 0.65);
    box-shadow: 0 0 0 3px rgba(47, 127, 255, 0.08);
  }

  .input-icon {
    color: #697386;
    margin-left: 16px;
    margin-right: 10px;
    font-size: 9px;
  }

  input {
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #eceff5;
    font-size: 14px;
    padding-right: 8px;
    min-width: 0;
  }

  input::placeholder {
    color: #5e6676;
  }

  .eye-button {
    width: 42px;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: #697386;
    box-shadow: none;
    font-size: 14px;
    cursor: pointer;
  }

  .eye-button:hover {
    color: #8fc6ff;
    transform: none;
    box-shadow: none;
  }

  .requirements {
    margin-top: 17px;
    padding: 14px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .requirements strong {
    display: block;
    color: #c7cedc;
    font-size: 11px;
    margin-bottom: 9px;
  }

  .requirement {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #626b7c;
    font-size: 10px;
    margin-top: 5px;
  }

  .requirement span {
    width: 13px;
    text-align: center;
  }

  .requirement.valid {
    color: #8de4b7;
  }

  .alert {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    padding: 12px 13px;
    margin-top: 15px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.5;
  }

  .alert > span {
    flex: 0 0 auto;
    font-weight: 800;
  }

  .error {
    color: #ffb4b4;
    background: rgba(255, 70, 70, 0.08);
    border: 1px solid rgba(255, 70, 70, 0.15);
  }

  .success {
    color: #a9f5d0;
    background: rgba(50, 210, 130, 0.08);
    border: 1px solid rgba(50, 210, 130, 0.15);
  }

  .submit-button,
  .primary-link {
    margin-top: 18px;
    min-height: 54px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, #2f7fff, #29cfff);
    color: white;
    font-weight: 800;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
    box-shadow: 0 12px 30px rgba(47, 127, 255, 0.2);
    text-decoration: none;
  }

  .submit-button:hover:not(:disabled),
  .primary-link:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 35px rgba(47, 127, 255, 0.28);
  }

  .submit-button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .primary-link {
    margin-top: 20px;
  }

  .back-link {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    margin-top: 22px;
    color: #8fc6ff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
  }

  .back-link:hover {
    color: #b6f4ff;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .security-note {
    display: flex;
    gap: 12px;
    margin-top: 30px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
  }

  .security-note > span {
    font-size: 15px;
  }

  .security-note strong {
    display: block;
    color: #c7cedc;
    font-size: 11px;
    margin-bottom: 4px;
  }

  .security-note p {
    color: #6f7788;
    font-size: 10px;
    line-height: 1.5;
    margin: 0;
  }

  .footer {
    position: absolute;
    bottom: 22px;
    color: #4f5665;
    font-size: 10px;
    letter-spacing: 0.04em;
    z-index: 2;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 560px) {
    .reset-page {
      padding: 20px 14px 65px;
    }

    .reset-card {
      padding: 28px 22px;
      border-radius: 20px;
    }

    .brand {
      margin-bottom: 30px;
    }

    .footer {
      font-size: 9px;
    }
  }
`;