import { useState } from "react";
import { registerUser } from "../services/userApi.js";
import { getErrorMessage } from "../utils/errors.js";

const initialForm = {
  name: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "BILLING_ADMIN",
};

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

export function RegisterUserPage({ onBack, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: field === "phoneNumber" ? normalizePhone(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber,
        password: form.password,
        role: form.role,
      };

      await registerUser(payload);
      setForm(initialForm);
      setMessage("New user registered successfully.");
      onSaved?.("New user registered successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to register user"));
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
        <span>Register New User</span>
      </div>

      <form className="user-register-form" onSubmit={handleSubmit}>
        <fieldset className="form-section">
          <legend>User Details</legend>

          <div className="user-register-grid">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Full name"
              />
            </label>

            <label className="field">
              <span>Email / Login ID</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="user@example.com"
              />
            </label>

            <label className="field">
              <span>Phone</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength="10"
                value={form.phoneNumber}
                onChange={(event) => updateField("phoneNumber", event.target.value)}
                placeholder="10 digit mobile number"
                required
              />
            </label>

            <label className="field">
              <span>Role</span>
              <select
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
              >
                <option value="BILLING_ADMIN">Billing Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
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
            {loading ? "Registering..." : "Register User"}
          </button>
        </div>
      </form>
    </section>
  );
}
