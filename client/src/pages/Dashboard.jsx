/**
 * pages/Dashboard.jsx — Patient home dashboard
 * Shows upcoming appointments summary and quick actions
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    axios.get("/api/appointments", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const upcoming = appointments.filter(a =>
    ["Pending", "Confirmed"].includes(a.Status)
  ).slice(0, 3);

  const statusBadge = (s) => (
    <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
  );

  return (
    <div className="page">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Hello, {user?.fullName} 👋</h1>
        <p className="page-sub">Welcome to your ClinicCare dashboard</p>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <Link to="/book" className="btn btn-primary">📅 Book Appointment</Link>
        <Link to="/doctors" className="btn btn-outline">👨‍⚕️ View Doctors</Link>
        <Link to="/appointments" className="btn btn-outline">📋 My Appointments</Link>
      </div>

      {/* Upcoming appointments */}
      <div className="card">
        <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Upcoming Appointments</h2>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : upcoming.length === 0 ? (
          <div className="alert alert-info">
            No upcoming appointments. <Link to="/book">Book one now →</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((a) => (
                  <tr key={a.AppointmentID}>
                    <td><strong>{a.DoctorName}</strong></td>
                    <td>{a.Specialty}</td>
                    <td>{new Date(a.AppointmentDate).toLocaleString()}</td>
                    <td>{statusBadge(a.Status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {upcoming.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <Link to="/appointments" className="btn btn-outline btn-sm">View all →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
