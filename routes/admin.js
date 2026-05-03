/**
 * routes/admin.js — Admin-only panel routes
 * All routes require verifyAdmin middleware
 *
 * GET  /api/admin/patients                     — List all patients
 * GET  /api/admin/appointments                 — List all appointments
 * PUT  /api/admin/appointments/:id/status      — Update appointment status
 * DELETE /api/admin/patients/:id               — Delete patient
 * GET  /api/admin/stats                        — Dashboard statistics
 */

const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");

// All routes in this file require admin role
router.use(verifyAdmin);

// ─── GET /api/admin/stats — Dashboard summary numbers ────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [[{ totalPatients }]]     = await db.query("SELECT COUNT(*) AS totalPatients FROM Patients WHERE Role='patient'");
    const [[{ totalDoctors }]]      = await db.query("SELECT COUNT(*) AS totalDoctors FROM Doctors");
    const [[{ totalAppointments }]] = await db.query("SELECT COUNT(*) AS totalAppointments FROM Appointments");
    const [[{ pendingCount }]]      = await db.query("SELECT COUNT(*) AS pendingCount FROM Appointments WHERE Status='Pending'");

    res.json({ totalPatients, totalDoctors, totalAppointments, pendingCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats." });
  }
});

// ─── GET /api/admin/patients — All patients ───────────────────────────────────
router.get("/patients", async (req, res) => {
  try {
    const [patients] = await db.query(
      `SELECT PatientID, FullName, Email, PhoneNumber, DateOfBirth, CreatedAt
       FROM Patients WHERE Role = 'patient' ORDER BY CreatedAt DESC`
    );
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve patients." });
  }
});

// ─── DELETE /api/admin/patients/:id — Remove patient ─────────────────────────
router.delete("/patients/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM Patients WHERE PatientID = ? AND Role = 'patient'",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found." });
    }
    res.json({ message: "Patient removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove patient." });
  }
});

// ─── GET /api/admin/appointments — All appointments ───────────────────────────
router.get("/appointments", async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.AppointmentID, a.AppointmentDate, a.Status, a.ReasonForVisit, a.CreatedAt,
              p.FullName AS PatientName, p.Email AS PatientEmail,
              d.FullName AS DoctorName,  d.Specialty
       FROM Appointments a
       JOIN Patients p ON a.PatientID = p.PatientID
       JOIN Doctors  d ON a.DoctorID  = d.DoctorID
       ORDER BY a.AppointmentDate DESC`
    );
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve appointments." });
  }
});

// ─── PUT /api/admin/appointments/:id/status — Update appointment status ───────
router.put("/appointments/:id/status", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const [result] = await db.query(
      "UPDATE Appointments SET Status = ? WHERE AppointmentID = ?",
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }
    res.json({ message: `Appointment status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status." });
  }
});

module.exports = router;
