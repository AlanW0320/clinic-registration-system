/**
 * routes/appointments.js — Full CRUD for patient appointments
 * GET    /api/appointments         — Get logged-in patient's appointments
 * GET    /api/appointments/:id     — Get single appointment
 * POST   /api/appointments         — Book new appointment (Create)
 * PUT    /api/appointments/:id     — Update appointment (Update)
 * DELETE /api/appointments/:id     — Cancel appointment (Delete)
 */

const express    = require("express");
const router     = express.Router();
const db         = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// All appointment routes require a logged-in user
router.use(verifyToken);

// ─── GET /api/appointments — Patient's own appointments ───────────────────────
router.get("/", async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.AppointmentID, a.AppointmentDate, a.Status, a.ReasonForVisit, a.CreatedAt,
              d.FullName AS DoctorName, d.Specialty
       FROM Appointments a
       JOIN Doctors d ON a.DoctorID = d.DoctorID
       WHERE a.PatientID = ?
       ORDER BY a.AppointmentDate DESC`,
      [req.user.id]
    );
    res.json(appointments);
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ message: "Failed to retrieve appointments." });
  }
});

// ─── GET /api/appointments/:id — Single appointment ──────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, d.FullName AS DoctorName, d.Specialty,
              p.FullName AS PatientName
       FROM Appointments a
       JOIN Doctors d  ON a.DoctorID  = d.DoctorID
       JOIN Patients p ON a.PatientID = p.PatientID
       WHERE a.AppointmentID = ? AND a.PatientID = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve appointment." });
  }
});

// ─── POST /api/appointments — Book new appointment (Create) ──────────────────
router.post("/", async (req, res) => {
  const { doctorId, appointmentDate, reasonForVisit } = req.body;

  if (!doctorId || !appointmentDate) {
    return res.status(400).json({ message: "Doctor and appointment date are required." });
  }

  try {
    // Verify the doctor exists
    const [doctor] = await db.query(
      "SELECT DoctorID FROM Doctors WHERE DoctorID = ?", [doctorId]
    );
    if (doctor.length === 0) {
      return res.status(404).json({ message: "Selected doctor not found." });
    }

    const [result] = await db.query(
      `INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, ReasonForVisit, Status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [req.user.id, doctorId, appointmentDate, reasonForVisit || null]
    );

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointmentId: result.insertId,
    });
  } catch (err) {
    console.error("Book appointment error:", err);
    res.status(500).json({ message: "Failed to book appointment." });
  }
});

// ─── PUT /api/appointments/:id — Update appointment (Update) ─────────────────
router.put("/:id", async (req, res) => {
  const { appointmentDate, reasonForVisit, status } = req.body;

  try {
    // Only allow patient to update their own appointment
    const [existing] = await db.query(
      "SELECT * FROM Appointments WHERE AppointmentID = ? AND PatientID = ?",
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Patients can only cancel; status changes are admin-only
    const allowedStatus = req.user.role === "admin"
      ? ["Pending", "Confirmed", "Completed", "Cancelled"]
      : ["Cancelled"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(403).json({ message: "You can only cancel appointments." });
    }

    await db.query(
      `UPDATE Appointments
       SET AppointmentDate = ?, ReasonForVisit = ?, Status = ?
       WHERE AppointmentID = ? AND PatientID = ?`,
      [
        appointmentDate  || existing[0].AppointmentDate,
        reasonForVisit   || existing[0].ReasonForVisit,
        status           || existing[0].Status,
        req.params.id,
        req.user.id,
      ]
    );

    res.json({ message: "Appointment updated successfully." });
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ message: "Failed to update appointment." });
  }
});

// ─── DELETE /api/appointments/:id — Cancel appointment (Delete) ───────────────
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM Appointments WHERE AppointmentID = ? AND PatientID = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }
    res.json({ message: "Appointment cancelled successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel appointment." });
  }
});

module.exports = router;
