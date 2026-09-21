# MediCare – Telemedicine Platform (Unified Next.js App Router)

A modern full-stack web-based healthcare management system enabling patients to consult doctors remotely through a secure online platform. Built as a single unified Next.js full-stack application.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router)
- **Library**: React.js (JavaScript & JSX only)
- **Database**: MongoDB Atlas + Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Styling**: Vanilla CSS Design System with CSS Custom Properties
- **Icons**: Lucide React

---

## 📁 Unified Project Architecture

```text
c:\Bussiness Model\telemedcine\
├── app/
│   ├── api/
│   │   ├── health/route.js          # Health check API
│   │   ├── auth/
│   │   │   ├── register/route.js    # Registration API
│   │   │   ├── login/route.js       # Login API
│   │   │   └── me/route.js          # Profile API
│   │   ├── doctors/                 # Doctor search & profile APIs
│   │   ├── appointments/            # Booking & status APIs
│   │   ├── reports/                 # Medical document APIs
│   │   ├── prescriptions/           # Digital Rx APIs
│   │   ├── messages/                # Consultation chat APIs
│   │   └── admin/                   # Platform stats & doctor verification APIs
│   │
│   ├── login/page.jsx               # Login UI
│   ├── register/page.jsx            # Register UI
│   ├── doctors/                     # Doctor Directory & Profile Details UI
│   ├── patient/dashboard/page.jsx   # Patient Portal UI
│   ├── doctor/dashboard/page.jsx    # Doctor Portal & Rx Modal UI
│   ├── admin/dashboard/page.jsx     # Admin Control Center UI
│   ├── appointments/page.jsx        # Appointments History UI
│   ├── medical-records/page.jsx     # Medical Reports Storage UI
│   ├── prescriptions/page.jsx       # Digital Rx & Printable Modal UI
│   ├── chat/page.jsx                # Live Consultation Chat UI
│   ├── consultation/page.jsx        # Tele-Video Screen UI
│   ├── layout.jsx                   # Root Layout with AuthProvider
│   ├── page.jsx                     # Home Page
│   └── globals.css                  # CSS Healthcare Design System
│
├── components/                      # Navbar, Footer, DoctorCard, ServiceCard
├── context/                         # AuthContext.jsx Provider
├── lib/
│   ├── mongodb.js                   # Cached Mongoose Connection Singleton
│   ├── auth.js                      # JWT & bcrypt Server Utilities
│   └── api.js                       # Client-side relative fetch helper
├── models/                          # User, Doctor, Appointment, Report, Rx, Message
├── seed.js                          # Database initialization seed script
├── .env.local                       # Single root environment variables file
├── .gitignore                       # Root Git ignore rules
├── jsconfig.json                    # Path alias (@/*) configuration
├── next.config.js                   # Next.js config
├── package.json                     # Root single package.json
└── README.md                        # Documentation
```

---

## 🚀 Setup & Execution Instructions

### 1. Environment Configuration (`.env.local`)
Create `.env.local` in the root directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database Seed (Optional)
```bash
npm run seed
```

### 4. Start Unified Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Test Credentials

- **Admin**: `admin@medicare.com` / `adminpassword123`
- **Doctor**: `dr.sarah@medicare.com` / `doctorpassword123`
- **Patient**: `john.patient@gmail.com` / `patientpassword123`
