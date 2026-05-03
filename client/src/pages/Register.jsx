/**
 * pages/Register.jsx — New patient registration
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    phoneNumber: "", dateOfBirth: "",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/register", form);
      setSuccess("Registration successful! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create account</h2>
        <p>Join ClinicCare to book appointments online</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" required value={form.fullName} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+60123456789" />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="Min. 8 characters" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
