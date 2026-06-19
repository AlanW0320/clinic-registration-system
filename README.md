# Clinic Registration System

A full-stack clinic appointment booking web application built for the UECS3223 Cloud Computing assignment. The system allows patients to register, browse doctors, and book appointments, while admins can manage the entire clinic through a dashboard.

**Stack:** Node.js + Express · React 18 · MySQL (Amazon RDS) · AWS Elastic Beanstalk

---

## Features

- Patient registration and JWT-based login
- Browse available doctors and their specialties
- Book, view, and cancel appointments
- Admin dashboard with clinic statistics, patient management, and appointment status control
- Protected routes (patient and admin roles)

---

## Project Structure

```
clinic-registration-system/
├── app.js                  # Express entry point
├── database_setup.sql      # MySQL schema + seed data
├── .env.example            # Environment variable template
├── .ebextensions/          # Elastic Beanstalk configuration
├── config/
│   └── db.js               # RDS connection pool
├── middleware/
│   └── auth.js             # JWT middleware (verifyToken, verifyAdmin)
├── routes/
│   ├── auth.js             # POST /api/auth/register, /login
│   ├── doctors.js          # GET /api/doctors
│   ├── appointments.js     # CRUD /api/appointments
│   └── admin.js            # GET|PUT|DELETE /api/admin/*
└── client/                 # React frontend (Create React App)
    └── src/
        ├── pages/          # Login, Register, Dashboard, Doctors, etc.
        ├── components/     # Navbar
        └── context/        # AuthContext
```

---

## Prerequisites

- Node.js >= 18.0.0
- npm
- An Amazon RDS MySQL instance (or local MySQL)

---

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd clinic-registration-system
npm run install-all
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=8080
NODE_ENV=development

DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=3306
DB_NAME=clinic_db
DB_USER=admin
DB_PASSWORD=your-db-password

JWT_SECRET=your-long-random-secret-here

S3_BUCKET_NAME=clinic-static-assets
AWS_REGION=ap-southeast-1
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Set up the database

Connect to your MySQL instance and run:

```bash
mysql -h <DB_HOST> -u admin -p < database_setup.sql
```

This creates the `clinic_db` database, all tables, seeds 5 sample doctors, and creates the default admin account.

### 4. Run the application

**Development (backend + frontend separately):**
```bash
# Terminal 1 — backend (port 8080)
npm run dev

# Terminal 2 — frontend (port 3000, proxies API to 8080)
cd client && npm start
```

**Production (serve built React from Express):**
```bash
npm run build-client
npm start
```


---

## API Endpoints

### Auth
| Method | Endpoint              | Description        | Auth     |
|--------|-----------------------|--------------------|----------|
| POST   | /api/auth/register    | Register patient   | None     |
| POST   | /api/auth/login       | Login              | None     |

### Doctors
| Method | Endpoint              | Description        | Auth     |
|--------|-----------------------|--------------------|----------|
| GET    | /api/doctors          | List all doctors   | None     |

### Appointments
| Method | Endpoint                   | Description                  | Auth    |
|--------|----------------------------|------------------------------|---------|
| GET    | /api/appointments          | Get my appointments          | Patient |
| POST   | /api/appointments          | Book an appointment          | Patient |
| PUT    | /api/appointments/:id      | Update my appointment        | Patient |
| DELETE | /api/appointments/:id      | Cancel my appointment        | Patient |

### Admin
| Method | Endpoint                              | Description               | Auth  |
|--------|---------------------------------------|---------------------------|-------|
| GET    | /api/admin/stats                      | Dashboard statistics      | Admin |
| GET    | /api/admin/patients                   | List all patients         | Admin |
| DELETE | /api/admin/patients/:id               | Remove a patient          | Admin |
| GET    | /api/admin/appointments               | List all appointments     | Admin |
| PUT    | /api/admin/appointments/:id/status    | Update appointment status | Admin |

---

## Database Schema

```
Patients       — PatientID, FullName, Email, PasswordHash, PhoneNumber, DateOfBirth, Role
Doctors        — DoctorID, FullName, Specialty, Email, PhoneNumber
Appointments   — AppointmentID, PatientID, DoctorID, AppointmentDate, Status, ReasonForVisit
```

---

## Deployment to AWS Elastic Beanstalk

### 1. Build the React frontend

```bash
npm run build-client
```

### 2. Create a deployment ZIP

Include everything except `node_modules`, `client/node_modules`, and `.env`:

```bash
zip -r deploy.zip . \
  --exclude "node_modules/*" \
  --exclude "client/node_modules/*" \
  --exclude ".env" \
  --exclude "*.git*"
```

### 3. Configure environment variables on Elastic Beanstalk

In the EB console under **Configuration > Software**, add all variables from `.env.example` with your production values.

### 4. Upload and deploy

In the EB console, create a new application (Node.js platform, Node 18) and upload the ZIP. The `.ebextensions/nodecommand.config` sets the start command automatically.

### 5. Set up RDS

- Create an RDS MySQL instance in the same region (`ap-southeast-1`)
- Set the security group to allow inbound MySQL (port 3306) from the EB environment's security group
- Run `database_setup.sql` to initialize the schema

---

## Environment Variables Reference

| Variable        | Description                          | Required |
|-----------------|--------------------------------------|----------|
| PORT            | Server port (default: 8080)          | Yes      |
| NODE_ENV        | `development` or `production`        | Yes      |
| DB_HOST         | RDS endpoint                         | Yes      |
| DB_PORT         | MySQL port (default: 3306)           | Yes      |
| DB_NAME         | Database name (`clinic_db`)          | Yes      |
| DB_USER         | Database username                    | Yes      |
| DB_PASSWORD     | Database password                    | Yes      |
| JWT_SECRET      | Secret key for signing JWTs          | Yes      |
| S3_BUCKET_NAME  | S3 bucket for static assets          | No       |
| AWS_REGION      | AWS region (e.g. `ap-southeast-1`)   | No       |
