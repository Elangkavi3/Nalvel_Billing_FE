import { NavLink, useNavigate } from "react-router-dom";

export function Header({ activePage, editingId, loading, onBack, onClear }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'http://nalvel.com/';
  }

  return (
    <section className="topbar">
      <div className="topbar-brand">
        <NavLink
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <img
            className="brand-logo"
            src="Logo.svg"
            alt="Nalvel Logistics Logo"
            style={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </NavLink>
        <span className="brand-divider">•</span>
        <NavLink
          to="/entry"
          className={({ isActive }) =>
            `brand-text${isActive ? " nav-active" : ""}`
          }
          style={{ textDecoration: "none" }}
        >
          Freight Data Entry
        </NavLink>
        <span className="brand-divider">•</span>
        <NavLink
          to="/register"
          className={({ isActive }) =>
            `brand-text${isActive ? " nav-active" : ""}`
          }
          style={{ textDecoration: "none" }}
        >
          Movement and Billing Register
        </NavLink>
        <span className="brand-divider">•</span>
        <NavLink
          to="/lr"
          className={({ isActive }) =>
            `brand-text${isActive ? " nav-active" : ""}`
          }
          style={{ textDecoration: "none" }}
        >
          LR Generation
        </NavLink>
        <div className="topbar-user">
          <div
            className="nl-avatar"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
            title="Home"
          >
            NL
          </div>
          <button
            type="button"
            className="topbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="top-actions">
        {activePage !== "home" &&
          activePage !== "view" &&
          activePage !== "lr" && (
            <>
              {activePage !== "data" && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={onClear}
                >
                  Clear
                </button>
              )}
            </>
          )}
        {activePage === "form" && (
          <>
            <button
              type="submit"
              className="btn primary"
              form="consignment-form"
              disabled={loading}
            >
              {editingId ? "Update Entry" : "Save Entry"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
