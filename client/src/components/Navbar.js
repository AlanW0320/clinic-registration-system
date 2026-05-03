import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? " nav-link-active" : "";

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">🏥 ClinicCare</Link>
      </div>

      <div className="navbar-links">
        {user.role === "admin" ? (
          <>
            <Link to="/dashboard" className={"nav-link" + isActive("/dashboard")}>Dashboard</Link>
            <Link to="/admin"     className={"nav-link" + isActive("/admin")}>Admin Panel</Link>
            <Link to="/doctors"   className={"nav-link" + isActive("/doctors")}>Doctors</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard"    className={"nav-link" + isActive("/dashboard")}>Dashboard</Link>
            <Link to="/doctors"      className={"nav-link" + isActive("/doctors")}>Doctors</Link>
            <Link to="/book"         className={"nav-link" + isActive("/book")}>Book</Link>
            <Link to="/appointments" className={"nav-link" + isActive("/appointments")}>My Appointments</Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span className="navbar-name">{user.fullName}</span>
        {user.role === "admin" && <span className="badge-admin">Admin</span>}
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
