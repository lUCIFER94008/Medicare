import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import DoctorCard from "@/components/DoctorCard";
import {
  Stethoscope,
  CalendarCheck,
  Video,
  FileText,
  UserCheck,
  ShieldCheck,
  Clock,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Star,
  Activity,
  Search,
  Users,
  Award,
  HeartPulse,
} from "lucide-react";

export default function HomePage() {
  const sampleDoctors = [
    {
      id: "doc-1",
      name: "Dr. Sarah Johnson",
      specialization: "General Physician",
      qualification: "MBBS, MD (Internal Medicine)",
      rating: 4.9,
      reviewsCount: 184,
      experience: "12+ Yrs Exp.",
      consultationFee: "$45",
      availability: "Available Today",
      isVerified: true,
      avatarBg: "linear-gradient(135deg, #087F5B 0%, #066B4D 100%)",
      initials: "SJ",
    },
    {
      id: "doc-2",
      name: "Dr. Michael Thomas",
      specialization: "Cardiologist",
      qualification: "MBBS, DM (Cardiology)",
      rating: 4.95,
      reviewsCount: 230,
      experience: "15+ Yrs Exp.",
      consultationFee: "$75",
      availability: "Available Tomorrow",
      isVerified: true,
      avatarBg: "linear-gradient(135deg, #0AA06E 0%, #087F5B 100%)",
      initials: "MT",
    },
    {
      id: "doc-3",
      name: "Dr. Emily Wilson",
      specialization: "Dermatologist",
      qualification: "MBBS, MD (Dermatology)",
      rating: 4.88,
      reviewsCount: 142,
      experience: "8+ Yrs Exp.",
      consultationFee: "$55",
      availability: "Available Today",
      isVerified: true,
      avatarBg: "linear-gradient(135deg, #087F5B 0%, #066B4D 100%)",
      initials: "EW",
    },
  ];

  return (
    <>
      {/* 1. HERO SECTION */}
      <section
        style={{
          backgroundColor: "var(--bg-light)",
          paddingTop: "72px",
          paddingBottom: "88px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft Background Decorative Blobs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(221, 247, 236, 0.8) 0%, rgba(245, 252, 248, 0) 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Left Column Content */}
            <div>
              <div className="badge" style={{ marginBottom: "20px" }}>
                <HeartPulse size={16} /> #1 Modern Telemedicine Platform
              </div>

              <h1 className="heading-xl" style={{ marginBottom: "24px" }}>
                Better Health, <br />
                <span style={{ color: "var(--primary)" }}>Brighter Tomorrow.</span>
              </h1>

              <p className="text-lead" style={{ marginBottom: "32px", maxWidth: "540px" }}>
                Connect with trusted doctors, book appointments, manage your health records, and get quality medical care — all in one place.
              </p>

              {/* Search Bar in Hero */}
              <div
                className="glass-card"
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "36px",
                  maxWidth: "520px",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Search size={20} style={{ color: "var(--text-muted)", marginLeft: "8px" }} />
                <input
                  type="text"
                  placeholder="Search doctors, specialties, or symptoms..."
                  style={{
                    border: "none",
                    background: "transparent",
                    boxShadow: "none",
                    width: "100%",
                    fontSize: "0.95rem",
                    padding: "8px 0",
                  }}
                />
                <Link href="/doctors" className="btn btn-primary" style={{ flexShrink: 0, borderRadius: "var(--radius-lg)" }}>
                  Search
                </Link>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "48px" }}>
                <Link href="/doctors" className="btn btn-primary btn-lg">
                  Find a Doctor <ArrowRight size={20} />
                </Link>
                <Link href="/register" className="btn btn-outline btn-lg">
                  Get Started
                </Link>
              </div>

              {/* Stats Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "20px",
                  paddingTop: "24px",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)" }}>
                    500+
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                    Verified Specialists
                  </p>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)" }}>
                    10K+
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                    Happy Patients
                  </p>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)" }}>
                    24/7
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                    Medical Support
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column Floating Glass Visual */}
            <div style={{ position: "relative" }}>
              {/* Central Doctor Profile Card Visual */}
              <div
                className="glass-panel"
                style={{
                  padding: "32px",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 20px 40px rgba(26, 94, 67, 0.12)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "20px",
                    marginBottom: "20px",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        backgroundColor: "var(--mint)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                      }}
                    >
                      <Stethoscope size={26} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)" }}>
                        Dr. Sarah Johnson
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600" }}>
                        ● Live Consultation Active
                      </p>
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}>
                    Available Online
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--mint-light)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    marginBottom: "20px",
                    border: "1px dashed var(--primary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <Video size={18} style={{ color: "var(--primary)" }} />
                    <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      Encrypted Consultation Active
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    "Your latest lab results look healthy. I've sent your updated digital prescription to your patient dashboard."
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#FFFFFF",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <FileText size={20} style={{ color: "var(--primary)" }} />
                    <div>
                      <h5 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        Digital Prescription & Lab Report
                      </h5>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ready for Instant Download</p>
                    </div>
                  </div>
                  <span className="status-badge" style={{ backgroundColor: "var(--mint)", color: "var(--primary)" }}>
                    Verified Rx
                  </span>
                </div>
              </div>

              {/* Floating Glass Cards */}
              <div
                className="glass-card animate-float"
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: "-20px",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--mint)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>10K+</h5>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Happy Patients</p>
                </div>
              </div>

              <div
                className="glass-card animate-float"
                style={{
                  position: "absolute",
                  bottom: "-24px",
                  right: "-20px",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  animationDelay: "2.5s",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#FEF3C7",
                    color: "#D97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Star size={20} fill="#D97706" />
                </div>
                <div>
                  <h5 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>24/7</h5>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Medical Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOME QUICK ACTIONS (4 Glass Cards) */}
      <section className="section-padding" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                title: "Find Doctors",
                desc: "Browse verified specialists across 15+ medical disciplines.",
                icon: Stethoscope,
                href: "/doctors",
              },
              {
                title: "Book Appointments",
                desc: "Schedule flexible online or clinic consultation slots.",
                icon: CalendarCheck,
                href: "/appointments",
              },
              {
                title: "Online Consultation",
                desc: "Join secure video consultations from your browser.",
                icon: Video,
                href: "/consultation",
              },
              {
                title: "Digital Prescriptions",
                desc: "Access signed medical records & prescriptions anytime.",
                icon: FileText,
                href: "/prescriptions",
              },
            ].map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="glass-card"
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  backgroundColor: "var(--mint-light)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--mint)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <action.icon size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                    {action.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR HEALTHCARE SERVICES (6 Cards) */}
      <section id="services" className="section-padding" style={{ backgroundColor: "var(--bg-light)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge" style={{ marginBottom: "12px" }}>Our Healthcare Services</span>
            <h2 className="heading-lg" style={{ marginBottom: "16px" }}>Complete Healthcare Solutions</h2>
            <p className="text-lead" style={{ maxWidth: "600px", margin: "0 auto" }}>
              Experience smooth, patient-first care with our comprehensive suite of telemedicine services.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
            }}
          >
            <ServiceCard
              icon={Stethoscope}
              title="Doctor Consultation"
              description="Connect with qualified general physicians and medical specialists remotely."
              badgeText="Instant Access"
            />
            <ServiceCard
              icon={CalendarCheck}
              title="Appointment Booking"
              description="Choose your preferred doctor, select an open slot, and get immediate booking confirmation."
              badgeText="Easy Booking"
            />
            <ServiceCard
              icon={Video}
              title="Video Consultation"
              description="Encrypted face-to-face video calls with doctor screen sharing and digital guidance."
              badgeText="HD Video"
            />
            <ServiceCard
              icon={FileText}
              title="Digital Prescription"
              description="Official digital prescriptions automatically sent to your patient portal after consultation."
              badgeText="Instant Rx"
            />
            <ServiceCard
              icon={Award}
              title="Medical Records"
              description="Store and access lab reports, diagnostic scans, and medical history in a safe cloud vault."
              badgeText="Encrypted Storage"
            />
            <ServiceCard
              icon={MessageSquare}
              title="Patient–Doctor Chat"
              description="Direct message your consulting doctor for follow-up questions and care instructions."
              badgeText="Real-time Chat"
            />
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (4 Step Process) */}
      <section className="section-padding" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge" style={{ marginBottom: "12px" }}>How It Works</span>
            <h2 className="heading-lg" style={{ marginBottom: "16px" }}>4 Easy Steps to Better Health</h2>
            <p className="text-lead" style={{ maxWidth: "560px", margin: "0 auto" }}>
              Getting quality healthcare has never been this simple and accessible.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up in under 2 minutes as a patient with your email and basic details.",
                icon: UserCheck,
              },
              {
                step: "02",
                title: "Find Doctor",
                desc: "Browse and filter verified doctors by specialization, experience, and fee.",
                icon: Stethoscope,
              },
              {
                step: "03",
                title: "Book Appointment",
                desc: "Pick your preferred time slot and share your symptoms securely.",
                icon: CalendarCheck,
              },
              {
                step: "04",
                title: "Consult Online",
                desc: "Attend video call consultation, chat, and receive your digital prescription.",
                icon: Video,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: "32px 24px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "var(--bg-light)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    color: "rgba(10, 160, 110, 0.2)",
                    position: "absolute",
                    top: "16px",
                    right: "20px",
                  }}
                >
                  {item.step}
                </span>

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "var(--mint)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <item.icon size={24} />
                </div>

                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "700",
                    fontFamily: "'Outfit', sans-serif",
                    marginBottom: "10px",
                    color: "var(--text-primary)",
                  }}
                >
                  {item.title}
                </h3>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.5" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE MEDICARE */}
      <section className="section-padding" style={{ backgroundColor: "var(--bg-light)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "48px",
              alignItems: "center",
            }}
          >
            <div>
              <span className="badge" style={{ marginBottom: "16px" }}>
                Why Choose MediCare?
              </span>
              <h2 className="heading-lg" style={{ marginBottom: "20px" }}>
                Trusted Healthcare Platform for You & Your Family
              </h2>
              <p className="text-lead" style={{ marginBottom: "32px" }}>
                Designed with a modern pale-green aesthetic, MediCare provides a calm, safe, and intuitive experience for remote healthcare.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                {[
                  "Verified Doctors",
                  "Secure Medical Records",
                  "Easy Appointment Booking",
                  "Online Consultations",
                  "Digital Prescriptions",
                  "24/7 Healthcare Access",
                ].map((feature, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: "40px",
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-xl)",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--primary)",
                  marginBottom: "16px",
                }}
              >
                Healthcare Security & Privacy
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
                All consultation sessions, patient medical records, diagnostic reports, and prescriptions are protected with bank-grade encryption standards.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <ShieldCheck size={20} style={{ color: "var(--primary)" }} />
                  <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    Encrypted & Confidential Data
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Clock size={20} style={{ color: "var(--primary)" }} />
                  <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    24/7 Healthcare Portal Availability
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED DOCTORS SECTION */}
      <section className="section-padding" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge" style={{ marginBottom: "12px" }}>Medical Experts</span>
            <h2 className="heading-lg" style={{ marginBottom: "16px" }}>Consult Our Top Specialists</h2>
            <p className="text-lead" style={{ maxWidth: "580px", margin: "0 auto" }}>
              Our verified medical professionals are ready to assist you with compassionate online care.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
              marginBottom: "40px",
            }}
          >
            {sampleDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link href="/doctors" className="btn btn-primary btn-lg">
              View All Doctors <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
