/**
 * pages/AdminDashboard.jsx — Clinic staff admin panel
 * Manage all patients, doctors, and appointments
 */

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TABS = ["Overview", "Appointments", "Patients", "Doctors"];

const AdminDashboard = () => {
  const { token } = useAuth();
  const [tab,          setTab]          = useState("Overview");
  const [stats,        setStats]        = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState("");
  const [newDoctor,    setNewDoctor]    = useState({ fullName: "", specialty: "", email: "", phoneNumber: "" });
  const [showAddDoc,   setShowAddDoc]   = useState(false);

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  // ── Fetch data based on active tab ───────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "Overview") {
        const { data } = await axios.get("/api/admin/stats", auth);
        setStats(data);
      } else if (tab === "Appointments") {
        const { data } = await axios.get("/api/admin/appointments", auth);
        setAppointments(data);
      } else if (tab === "Patients") {
        const { data } = await axios.get("/api/admin/patients", auth);
        setPatients(data);
      } else if (tab === "Doctors") {
        const { data } = await axios.get("/api/doctors", auth);
        setDoctors(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [tab]); // eslint-disable-line

  useEffect(() => { loadData(); }, [loadData]);

  // ── Update appointment status ─────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/appointments/${id}/status`, { status }, auth);
      flash(`Status updated to ${status}`);
      loadData();
    } catch { flash("Failed to update status."); }
  };

  // ── Delete patient ────────────────────────────────────────────────────────
  const deletePatient = async (id) => {
    if (!window.confirm("Remove this patient? All their appointments will be deleted.")) return;
    try {
      await axios.delete(`/api/admin/patients/${id}`, auth);
      flash("Patient removed.");
      loadData();
    } catch { flash("Failed to remove patient."); }
  };

  // ── Add doctor ────────────────────────────────────────────────────────────
  const addDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/doctors", newDoctor, auth);
      flash("Doctor added successfully.");
      setNewDoctor({ fullName: "", specialty: "", email: "", phoneNumber: "" });
      setShowAddDoc(false);
      loadData();
    } catch (err) { flash(err.response?.data?.message || "Failed to add doctor."); }
  };

  // ── Delete doctor ─────────────────────────────────────────────────────────
  const deleteDoctor = async (id) => {
    if (!window.confirm("Remove this doctor?")) return;
    try {
      await axios.delete(`/api/doctors/${id}`, auth);
      flash("Doctor removed.");
      loadData();
    } catch { flash("Failed to remove doctor."); }
  };

  const statusBadge = (s) => (
    <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
  );

  return (
    <div className="page">
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-sub">Manage clinic operations</p>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline"}`}
          >{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === "Overview" && stats && (
            <div className="stats-grid">
              {[
                { label: "Total Patients",      value: stats.totalPatients,      icon: "🧑‍🤝‍🧑" },
                { label: "Total Doctors",       value: stats.totalDoctors,       icon: "👨‍⚕️" },
                { label: "Total Appointments",  value: stats.totalAppointments,  icon: "📅" },
                { label: "Pending Approvals",   value: stats.pendingCount,       icon: "⏳" },
              ].map(({ label, value, icon }) => (
                <div className="stat-card" key={label}>
                  <div style={{ fontSize: "1.8rem" }}>{icon}</div>
                  <div className="stat-number">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Appointments ── */}
          {tab === "Appointments" && (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Change Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.AppointmentID}>
                        <td>{a.PatientName}<br /><small style={{ color: "#9ca3af" }}>{a.PatientEmail}</small></td>
                        <td>{a.DoctorName}<br /><small style={{ color: "#9ca3af" }}>{a.Specialty}</small></td>
                        <td>{new Date(a.AppointmentDate).toLocaleString()}</td>
                        <td>{a.ReasonForVisit || "—"}</td>
                        <td>{statusBadge(a.Status)}</td>
                        <td>
                          <select
                            value={a.Status}
                            onChange={(e) => updateStatus(a.AppointmentID, e.target.value)}
                            style={{ padding: "0.3rem 0.5rem", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                          >
                            {["Pending", "Confirmed", "Completed", "Cancelled"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Patients ── */}
          {tab === "Patients" && (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.PatientID}>
                        <td>{p.FullName}</td>
                        <td>{p.Email}</td>
                        <td>{p.PhoneNumber || "—"}</td>
                        <td>{new Date(p.CreatedAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => deletePatient(p.PatientID)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Doctors ── */}
          {tab === "Doctors" && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ fontWeight: 600 }}>Manage Doctors</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddDoc(!showAddDoc)}>
                  {showAddDoc ? "Cancel" : "+ Add Doctor"}
                </button>
              </div>

              {showAddDoc && (
                <form onSubmit={addDoctor} style={{ background: "#f9fafb", padding: "1rem", borderRadius: 10, marginBottom: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Full Name *</label>
                      <input required value={newDoctor.fullName} onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Specialty</label>
                      <input value={newDoctor.specialty} onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Email *</label>
                      <input type="email" required value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Phone</label>
                      <input value={newDoctor.phoneNumber} onChange={(e) => setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success btn-sm" style={{ marginTop: "0.75rem" }}>Save Doctor</button>
                </form>
              )}

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Specialty</th><th>Email</th><th>Phone</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {doctors.map((d) => (
                      <tr key={d.DoctorID}>
                        <td>{d.FullName}</td>
                        <td>{d.Specialty || "—"}</td>
                        <td>{d.Email}</td>
                        <td>{d.PhoneNumber || "—"}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteDoctor(d.DoctorID)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
