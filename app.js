/**
 * app.js — Main entry point for the Clinic Registration System
 * Elastic Beanstalk looks for this file by default (Node.js platform)
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/doctors",      require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/admin",        require("./routes/admin"));

// ─── Serve React Frontend (Production Build) ──────────────────────────────────
// The React app is built into client/build by `npm run build-client`
app.use(express.static(path.join(__dirname, "client", "build")));

// All non-API routes return the React app (client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Clinic Registration System running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
