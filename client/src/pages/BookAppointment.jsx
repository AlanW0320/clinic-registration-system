/**
 * pages/BookAppointment.jsx — Book a new appointment (Create)
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BookAppointment = () => {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [form,    setForm]    = useState({
    doctorId:        searchParams.get("doctorId") || "",
    appointmentDate: "",
    reasonForVisit:  "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/doctors").then(({ data }) => setDoctors(data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.doctorId || !form.appointmentDate) {
      return setError("Please select a doctor and appointment date.");
    }

    // Prevent booking in the past
    if (new Date(form.appointmentDate) < new Date()) {
      return setError("Please select a future date and time.");
    }

    setLoading(true);
    try {
      await axios.post("/api/appointments", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/appointments");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  // Get min datetime string (now, rounded to nearest minute)
  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="page">
      <h1 className="page-title">Book Appointment</h1>
      <p className="page-sub">Schedule a visit with one of our doctors</p>

      <div className="card" style={{ maxWidth: 520 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Doctor</label>
            <select name="doctorId" required value={form.doctorId} onChange={handleChange}>
              <option value="">-- Choose a doctor --</option>
              {doctors.map((d) => (
                <option key={d.DoctorID} value={d.DoctorID}>
                  {d.FullName} {d.Specialty ? `— ${d.Specialty}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Appointment Date & Time</label>
            <input
              type="datetime-local"
              name="appointmentDate"
              required
              min={minDate}
              value={form.appointmentDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Reason for Visit <span style={{ color: "#9ca3af" }}>(optional)</span></label>
            <textarea
              name="reasonForVisit"
              value={form.reasonForVisit}
              onChange={handleChange}
              placeholder="Briefly describe your symptoms or reason…"
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Booking…" : "Confirm Booking"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
