# MediCare – Telemedicine Platform

A modern, full-stack web-based healthcare management system enabling patients to consult doctors remotely through a secure online platform.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Library**: React.js (JavaScript & JSX only)
- **Styling**: Vanilla CSS Design System with CSS Custom Properties
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

---

## 📁 Project Architecture

```text
c:\Bussiness Model\telemedcine\
├── frontend/
│   ├── app/
│   │   ├── page.jsx             # Home Page
│   │   ├── login/               # Authentication Login
│   │   ├── register/            # Patient & Doctor Registration
│   │   ├── doctors/             # Doctor Directory & Details ([id])
│   │   ├── patient/dashboard/   # Patient Portal
│   │   ├── doctor/dashboard/    # Doctor Portal
│   │   ├── admin/dashboard/     # Admin Control Center & Doctor Verification
│   │   ├── appointments/        # Consultation Appointments
│   │   ├── medical-records/     # Patient Medical Document Storage
│   │   ├── prescriptions/       # Digital Prescription Viewer & Print
│   │   ├── chat/                # Live Consultation Chat
│   │   └── consultation/        # WebRTC Tele-Video Screen
│   ├── components/              # Reusable Navbar, Footer, Cards
│   ├── context/                 # AuthContext Provider
│   ├── lib/                     # API Fetch Helpers
│   └── package.json
│
└── backend/
    ├── config/
    │   └── db.js                # MongoDB Atlas Mongoose Connection
    ├── controllers/             # Auth, Doctor, Appointment, Report, Rx, Admin
    ├── middleware/              # Auth & Error Handlers
    ├── models/                  # User, Doctor, Appointment, Report, Rx, Message
    ├── routes/                  # Express REST Route Definitions
    ├── seed.js                  # Database Initialization Seeder
    ├── server.js                # Express API Server Entrypoint
    └── package.json
```

---

## 🚀 Setup & Execution Instructions

### 1. Configure Environment Files

**Backend Configuration (`backend/.env`):**
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

**Frontend Configuration (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Start Backend REST API Server

```bash
cd backend
npm install
npm run seed     # (Optional) Seed sample admin, doctors, & patients
npm run dev      # Starts Express API server on http://localhost:5000
```

### 3. Start Frontend Next.js Web App

```bash
cd frontend
npm install
npm run dev      # Starts Next.js server on http://localhost:3000
```

---

## 🔒 Security & Privacy Features

- Passwords are salted and hashed using `bcryptjs` (never stored as plain text).
- Role-based authorization enforced (`patient`, `doctor`, `admin`).
- MongoDB Atlas credentials are isolated in `backend/.env` and never exposed to browser client code.
- Public Doctor search lists only `isVerified = true` doctors verified by Admin.
