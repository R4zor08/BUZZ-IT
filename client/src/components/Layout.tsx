import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Layout() {
  const { session, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topnav">
        <div className="topnav-left">
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
          </nav>
        </div>
        {session && (
          <div className="topnav-right">
            <div className="topnav-user muted">
              <span>{session.username}</span>
              <span className="dot-sep">·</span>
              <span>{session.role}</span>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => logout()}>
              Log out
            </button>
          </div>
        )}
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
