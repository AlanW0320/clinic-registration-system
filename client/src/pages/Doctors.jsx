/**
 * pages/Doctors.jsx — Browse all clinic doctors
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/doctors")
      .then(({ data }) => setDoctors(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const initials = (name) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const filtered = doctors.filter(d =>
    d.FullName.toLowerCase().includes(search.toLowerCase()) ||
    (d.Specialty || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <h1 className="page-title">Our Doctors</h1>
      <p className="page-sub">Browse available medical professionals</p>

      <div className="form-group" style={{ maxWidth: 360, marginBottom: "1.5rem" }}>
        <input
          placeholder="Search by name or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No doctors found.</div>
      ) : (
        <div className="doctors-grid">
          {filtered.map((doc) => (
            <div className="doctor-card" key={doc.DoctorID}>
              <div className="doctor-avatar">{initials(doc.FullName)}</div>
              <div className="doctor-name">{doc.FullName}</div>
              <div className="doctor-specialty">{doc.Specialty || "General Practitioner"}</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
                📧 {doc.Email}
                {doc.PhoneNumber && <><br />📞 {doc.PhoneNumber}</>}
              </div>
              <Link
                to={`/book?doctorId=${doc.DoctorID}&doctorName=${encodeURIComponent(doc.FullName)}`}
                className="btn btn-primary btn-sm"
              >
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
