/**
 * routes/doctors.js — Doctor listing and profiles
 * GET  /api/doctors         — Get all doctors
 * GET  /api/doctors/:id     — Get doctor by ID
 * POST /api/doctors         — Add doctor (admin only)
 * PUT  /api/doctors/:id     — Update doctor (admin only)
 * DELETE /api/doctors/:id   — Delete doctor (admin only)
 */

const express     = require("express");
const router      = express.Router();
const db          = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// ─── GET /api/doctors — Public: list all doctors ─────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [doctors] = await db.query(
      "SELECT DoctorID, FullName, Specialty, Email, PhoneNumber FROM Doctors ORDER BY FullName"
    );
    res.json(doctors);
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({ message: "Failed to retrieve doctors." });
  }
});

// ─── GET /api/doctors/:id — Public: get single doctor ────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DoctorID, FullName, Specialty, Email, PhoneNumber FROM Doctors WHERE DoctorID = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve doctor." });
  }
});

// ─── POST /api/doctors — Admin: add new doctor ───────────────────────────────
router.post("/", verifyAdmin, async (req, res) => {
  const { fullName, specialty, email, phoneNumber } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ message: "Full name and email are required." });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO Doctors (FullName, Specialty, Email, PhoneNumber) VALUES (?, ?, ?, ?)",
      [fullName, specialty || null, email, phoneNumber || null]
    );
    res.status(201).json({ message: "Doctor added.", doctorId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: "Failed to add doctor." });
  }
});

// ─── PUT /api/doctors/:id — Admin: update doctor ─────────────────────────────
router.put("/:id", verifyAdmin, async (req, res) => {
  const { fullName, specialty, email, phoneNumber } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE Doctors SET FullName=?, Specialty=?, Email=?, PhoneNumber=? WHERE DoctorID=?`,
      [fullName, specialty, email, phoneNumber, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found." });
    }
    res.json({ message: "Doctor updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update doctor." });
  }
});

// ─── DELETE /api/doctors/:id — Admin: delete doctor ──────────────────────────
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM Doctors WHERE DoctorID = ?", [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found." });
    }
    res.json({ message: "Doctor deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete doctor." });
  }
});

module.exports = router;
