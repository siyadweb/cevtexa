"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = getSupabaseClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });

      if (resetError) {
        throw resetError;
      }

      setMessage(
        "If an account exists with this email, a password reset link has been sent."
      );
      setEmail("");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to send the reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="forgot-page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <section className="forgot-card">
        <div className="brand">
          <div className="brand-mark">C</div>

          <div>
            <div className="brand-name">CEVTEXA</div>
            <div className="brand-subtitle">ADMIN SYSTEM</div>
          </div>
        </div>

        <div className="icon-wrap">
          <span>↗</span>
        </div>

        <h1>Reset your password</h1>

        <p className="description">
          Enter your admin email address and we&apos;ll send you a secure
          password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Admin email</label>

          <div className="input-wrap">
            <span className="input-icon">✉</span>

            <input
              id="email"
              type="email"
              placeholder="you@cevtexa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="alert error">
              <span>!</span>
              {error}
            </div>
          )}

          {message && (
            <div className="alert success">
              <span>✓</span>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Sending...
              </>
            ) : (
              <>
                Send reset link
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <Link href="/admin/login" className="back-link">
          <span>←</span>
          Back to admin login
        </Link>

        <div className="security-note">
          <span>🔒</span>
          <div>
            <strong>Secure recovery</strong>
            <p>
              Password reset links are time-limited and handled securely
              through Supabase Authentication.
            </p>
          </div>
        </div>
      </section>

      <div className="footer">
        © {new Date().getFullYear()} CEVTEXA · Secure Admin Access
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .forgot-page {
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

        .forgot-card {
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

        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 38px;
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
          font-size: 23px;
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
          color: #8b93a6;
          margin-left: 16px;
          margin-right: 10px;
          font-size: 15px;
        }

        input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #eceff5;
          font-size: 14px;
          padding-right: 15px;
        }

        input::placeholder {
          color: #5e6676;
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

        .alert span {
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

        button {
          margin-top: 18px;
          height: 54px;
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
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 35px rgba(47, 127, 255, 0.28);
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
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
          .forgot-page {
            padding: 20px 14px 65px;
          }

          .forgot-card {
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
      `}</style>
    </main>
  );
}