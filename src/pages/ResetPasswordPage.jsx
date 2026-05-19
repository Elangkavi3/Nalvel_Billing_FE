import { useState } from "react";
import { resetUserPassword } from "../services/userApi.js";
import { getErrorMessage } from "../utils/errors.js";

const initialForm = {
  email: "",
  newPassword: "",
  confirmPassword: "",
};

export function ResetPasswordPage({ onBack, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      await resetUserPassword({
        email: form.email.trim(),
        newPassword: form.newPassword,
      });
      setForm(initialForm);
      setMessage("Password reset successfully.");
      onSaved?.("Password reset successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to reset password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="user-register-page">
      <div className="form-header">
        <button type="button" className="header-back" onClick={onBack}>
          Back
        </button>
        <span>Reset Password</span>
      </div>

      <form className="user-register-form" onSubmit={handleSubmit}>
        <fieldset className="form-section">
          <legend>Password Details</legend>

          <div className="user-register-grid">
            <label className="field">
              <span>Email / Login ID</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="user@example.com"
                required
              />
            </label>

            <label className="field">
              <span>New Password</span>
              <input
                type="password"
                value={form.newPassword}
                onChange={(event) =>
                  updateField("newPassword", event.target.value)
                }
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <label className="field">
              <span>Confirm Password</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                placeholder="Re-enter password"
                required
              />
            </label>
          </div>
        </fieldset>

        {error ? <p className="user-register-error">{error}</p> : null}
        {message ? <p className="user-register-message">{message}</p> : null}

        <div className="user-register-actions">
          <button type="button" className="btn ghost" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
