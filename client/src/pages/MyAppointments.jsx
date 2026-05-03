/**
 * pages/MyAppointments.jsx — Patient's appointment list with update & cancel (CRUD)
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const MyAppointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [editingId,    setEditingId]    = useState(null);
  const [editForm,     setEditForm]     = useState({ appointmentDate: "", reasonForVisit: "" });
  const [message,      setMessage]      = useState("");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAppointments = () => {
    setLoading(true);
    axios.get("/api/appointments", authHeader)
      .then(({ data }) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);  // eslint-disable-line

  // ── Cancel appointment ────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await axios.delete(`/api/appointments/${id}`, authHeader);
      setMessage("Appointment cancelled.");
      fetchAppointments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel.");
    }
  };

  // ── Open edit form ────────────────────────────────────────────────────────
  const startEdit = (appt) => {
    setEditingId(appt.AppointmentID);
    setEditForm({
      appointmentDate: new Date(appt.AppointmentDate).toISOString().slice(0, 16),
      reasonForVisit:  appt.ReasonForVisit || "",
    });
  };

  // ── Save edited appointment ───────────────────────────────────────────────
  const handleUpdate = async (id) => {
    try {
      await axios.put(`/api/appointments/${id}`, editForm, authHeader);
      setMessage("Appointment updated successfully.");
      setEditingId(null);
      fetchAppointments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update.");
    }
  };

  const statusBadge = (s) => (
    <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
  );

  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="page">
      <h1 className="page-title">My Appointments</h1>
      <p className="page-sub">View, update, or cancel your appointments</p>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{message}</div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <Link to="/book" className="btn btn-primary btn-sm">+ New Appointment</Link>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : appointments.length === 0 ? (
        <div className="card">
          <div className="alert alert-info">
            No appointments yet. <Link to="/book">Book your first →</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <React.Fragment key={a.AppointmentID}>
                    <tr>
                      <td><strong>{a.DoctorName}</strong></td>
                      <td>{a.Specialty}</td>
                      <td>{new Date(a.AppointmentDate).toLocaleString()}</td>
                      <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.ReasonForVisit || "—"}
                      </td>
                      <td>{statusBadge(a.Status)}</td>
                      <td>
                        {["Pending", "Confirmed"].includes(a.Status) && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => startEdit(a)}
                            >Edit</button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(a.AppointmentID)}
                            >Cancel</button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Inline edit row */}
                    {editingId === a.AppointmentID && (
                      <tr style={{ background: "#fffbeb" }}>
                        <td colSpan={6} style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                            <div className="form-group" style={{ margin: 0, flex: 1 }}>
                              <label>New Date & Time</label>
                              <input
                                type="datetime-local" min={minDate}
                                value={editForm.appointmentDate}
                                onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0, flex: 2 }}>
                              <label>Reason</label>
                              <input
                                value={editForm.reasonForVisit}
                                onChange={(e) => setEditForm({ ...editForm, reasonForVisit: e.target.value })}
                                placeholder="Update reason…"
                              />
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleUpdate(a.AppointmentID)}>Save</button>
                              <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
