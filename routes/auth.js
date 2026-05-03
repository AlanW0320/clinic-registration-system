/**
 * routes/auth.js — Patient registration and login
 * POST /api/auth/register
 * POST /api/auth/login
 */

const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../config/db");

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { fullName, email, password, phoneNumber, dateOfBirth } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required." });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query(
      "SELECT PatientID FROM Patients WHERE Email = ?", [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Hash password before storing (never store plaintext)
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new patient
    const [result] = await db.query(
      `INSERT INTO Patients (FullName, Email, PasswordHash, PhoneNumber, DateOfBirth, Role)
       VALUES (?, ?, ?, ?, ?, 'patient')`,
      [fullName, email, passwordHash, phoneNumber || null, dateOfBirth || null]
    );

    res.status(201).json({
      message: "Registration successful.",
      patientId: result.insertId,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Fetch patient by email
    const [rows] = await db.query(
      "SELECT * FROM Patients WHERE Email = ?", [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const patient = rows[0];

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, patient.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT token (expires in 8 hours)
    const token = jwt.sign(
      { id: patient.PatientID, email: patient.Email, role: patient.Role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id:       patient.PatientID,
        fullName: patient.FullName,
        email:    patient.Email,
        role:     patient.Role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

module.exports = router;
