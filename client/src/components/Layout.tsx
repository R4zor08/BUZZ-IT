import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Layout() {
  const { session, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topnav">
        <NavLink to="/posts" className="brand">
          BuzzIt
        </NavLink>
        <nav className="nav-links">
          <NavLink end to="/posts" className={({ isActive }) => (isActive ? "active" : "")}>
            Posts
          </NavLink>
          <NavLink end to="/reminders" className={({ isActive }) => (isActive ? "active" : "")}>
            Reminders
          </NavLink>
          {session && (
            <>
              <span className="muted">
                {session.username} · {session.role}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => logout()}>
                Log out
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
