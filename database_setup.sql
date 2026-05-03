-- ═══════════════════════════════════════════════════════════════════
-- Clinic Registration System — Database Setup Script
-- Run this on your Amazon RDS MySQL instance
-- ═══════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS clinic_db;
USE clinic_db;

-- ── 1. Patients Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Patients (
  PatientID    INT AUTO_INCREMENT PRIMARY KEY,
  FullName     VARCHAR(100)  NOT NULL,
  Email        VARCHAR(100)  UNIQUE NOT NULL,
  PasswordHash VARCHAR(255)  NOT NULL,
  PhoneNumber  VARCHAR(15),
  DateOfBirth  DATE,
  Role         ENUM('patient', 'admin') DEFAULT 'patient',
  CreatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Doctors Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Doctors (
  DoctorID    INT AUTO_INCREMENT PRIMARY KEY,
  FullName    VARCHAR(100) NOT NULL,
  Specialty   VARCHAR(100),
  Email       VARCHAR(100) UNIQUE NOT NULL,
  PhoneNumber VARCHAR(15)
);

-- ── 3. Appointments Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Appointments (
  AppointmentID   INT AUTO_INCREMENT PRIMARY KEY,
  PatientID       INT,
  DoctorID        INT,
  AppointmentDate DATETIME NOT NULL,
  Status          ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
  ReasonForVisit  TEXT,
  CreatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)  ON DELETE CASCADE,
  FOREIGN KEY (DoctorID)  REFERENCES Doctors(DoctorID)    ON DELETE CASCADE
);

-- ── Seed: Default Admin Account ───────────────────────────────────
-- Password: Admin@1234  (bcrypt hash — change in production!)
INSERT IGNORE INTO Patients (FullName, Email, PasswordHash, Role)
VALUES (
  'Clinic Admin',
  'admin@clinic.com',
  '$2a$12$cfSH7GKbaS2FfR7JswGwOe54MeC4aR.HobsOFiZUEgrTy8VBSIAVu',
  'admin'
);

-- ── Seed: Sample Doctors ──────────────────────────────────────────
INSERT IGNORE INTO Doctors (FullName, Specialty, Email, PhoneNumber) VALUES
  ('Dr. Sarah Tan',      'General Practitioner', 'sarah.tan@clinic.com',   '+60123456001'),
  ('Dr. James Lim',      'Cardiologist',         'james.lim@clinic.com',   '+60123456002'),
  ('Dr. Priya Nair',     'Dermatologist',        'priya.nair@clinic.com',  '+60123456003'),
  ('Dr. Ahmad Fauzi',    'Orthopaedic Surgeon',  'ahmad.fauzi@clinic.com', '+60123456004'),
  ('Dr. Emily Wong',     'Paediatrician',        'emily.wong@clinic.com',  '+60123456005');
