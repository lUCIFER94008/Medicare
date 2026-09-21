import Link from "next/link";
import ServiceCard from "../components/ServiceCard";
import DoctorCard from "../components/DoctorCard";
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
  Heart,
  Star,
  Users,
  Activity,
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
      avatarBg: "linear-gradient(135deg, #087F8C 0%, #055C66 100%)",
      initials: "SJ",
    },
    {
      id: "doc-2",
      name: "Dr. Michael Thomas",
      specialization: "Cardiologist",
      qualification: "MBBS, DM (Cardiology), FACC",
      rating: 4.95,
      reviewsCount: 230,
      experience: "15+ Yrs Exp.",
      consultationFee: "$75",
      availability: "Available Tomorrow",
      isVerified: true,
      avatarBg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
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
      avatarBg: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
      initials: "EW",
    },
  ];

  return (
    <>
      {/* ========================================================
          1. HERO SECTION
         ======================================================== */}
      <section
        style={{
          backgroundColor: "var(--bg-light)",
          paddingTop: "72px",
          paddingBottom: "88px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            backgroundColor: "var(--secondary)",
            opacity: 0.6,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div className="container">
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
                <Activity size={16} /> #1 Trusted Telemedicine Platform
              </div>

              <h1 className="heading-xl" style={{ marginBottom: "24px" }}>
                Quality Healthcare <br />
                <span style={{ color: "var(--primary)" }}>Anytime, Anywhere.</span>
              </h1>

              <p className="text-lead" style={{ marginBottom: "36px", maxWidth: "540px" }}>
                Connect with qualified doctors from the comfort of your home. Book appointments, attend online consultations, receive digital prescriptions and manage your medical records securely.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "48px" }}>
                <Link href="/doctors" className="btn btn-primary btn-lg">
                  Find a Doctor <ArrowRight size={20} />
                </Link>
                <Link href="/register" className="btn btn-outline btn-lg">
                  Get Started
                </Link>
              </div>

              {/* Key Trust Stats */}
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
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.75rem",
                      fontWeight: "700",
                      color: "var(--primary)",
                    }}
                  >
                    500+
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                    Qualified Doctors
                  </p>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.75rem",
                      fontWeight: "700",
                      color: "var(--primary)",
                    }}
                  >
                    10K+
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                    Happy Patients
                  </p>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.75rem",
                      fontWeight: "700",
                      color: "var(--primary)",
                    }}
                  >
                    24/7
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                    Healthcare Support
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column Healthcare Visual Dashboard Mockup */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F0FBFB 100%)",
                  borderRadius: "var(--radius-xl)",
                  padding: "32px",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 20px 40px -10px rgba(8, 127, 140, 0.15)",
                }}
              >
                {/* Visual Header */}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "var(--secondary)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                      }}
                    >
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>Live Video Consultation</h4>
                      <p style={{ fontSize: "0.8rem", color: "#047857", fontWeight: "600" }}>
                        ● Connected with Dr. Sarah
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "#FEE2E2",
                      color: "#DC2626",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    HD Live
                  </span>
                </div>

                {/* Consultation Card Content Visual */}
                <div
                  style={{
                    backgroundColor: "var(--primary-light)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    marginBottom: "20px",
                    border: "1px dashed var(--primary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <Video size={20} style={{ color: "var(--primary)" }} />
                    <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Tele-Consultation Active</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    "Your symptoms indicate mild allergic rhinitis. I have generated your digital prescription."
                  </p>
                </div>

                {/* Patient Record Pill Mockup */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#FFFFFF",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={20} style={{ color: "var(--primary)" }} />
                    <div>
                      <h5 style={{ fontSize: "0.875rem", fontWeight: "600" }}>Digital Rx & Lab Report</h5>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>Updated 5 mins ago</p>
                    </div>
                  </div>
                  <span className="badge">Verified</span>
                </div>
              </div>

              {/* Floating Floating Rating Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "-20px",
                  backgroundColor: "#FFFFFF",
                  padding: "14px 20px",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
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
                  <h5 style={{ fontSize: "0.95rem", fontWeight: "700" }}>4.9 / 5.0 Rating</h5>
                  <p style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>From 10,000+ Patient Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. SERVICES SECTION
         ======================================================== */}
      <section id="services" className="section-padding" style={{ backgroundColor: "var(--bg-white)" }}>
        <div className="container">
          <div className="section-header">
            <span className="badge">Our Medical Services</span>
            <h2 className="heading-lg">Everything You Need for Better Healthcare</h2>
            <p className="text-lead">
              Access complete medical care online with top certified specialists in just a few clicks.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "28px",
            }}
          >
            <ServiceCard
              icon={Stethoscope}
              title="Doctor Consultation"
              description="Connect with qualified general physicians and specialists remotely via high-definition audio/video calls."
              badgeText="Instant Access"
            />
            <ServiceCard
              icon={CalendarCheck}
              title="Book Appointment"
              description="Choose your preferred doctor, pick an available slot that suits your daily schedule, and confirm instantly."
              badgeText="Easy Scheduling"
            />
            <ServiceCard
              icon={Video}
              title="Video Consultation"
              description="Face-to-face encrypted telehealth video consultations with doctor screen sharing and live advice."
              badgeText="HD Video"
            />
            <ServiceCard
              icon={FileText}
              title="Digital Prescription"
              description="Receive official digital prescriptions directly on your patient portal ready for pharmacy download."
              badgeText="Instant Download"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          3. HOW IT WORKS SECTION
         ======================================================== */}
      <section className="section-padding" style={{ backgroundColor: "var(--bg-light)" }}>
        <div className="container">
          <div className="section-header">
            <span className="badge">Simple Process</span>
            <h2 className="heading-lg">How MediCare Works</h2>
            <p className="text-lead">Follow 4 easy steps to receive quality medical care without leaving your home.</p>
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
                desc: "Sign up in less than 2 minutes as a patient with your email and basic details.",
                icon: UserCheck,
              },
              {
                step: "02",
                title: "Find a Doctor",
                desc: "Filter experienced doctors by specialization, qualification, rating, and fee.",
                icon: Stethoscope,
              },
              {
                step: "03",
                title: "Book Appointment",
                desc: "Select a convenient consultation slot and provide your current medical context.",
                icon: CalendarCheck,
              },
              {
                step: "04",
                title: "Consult Online",
                desc: "Join live video call, chat in real-time, and get your digital prescription instantly.",
                icon: Video,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="card-base"
                style={{
                  padding: "32px 24px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    color: "var(--secondary-hover)",
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
                    backgroundColor: "var(--secondary)",
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
                  }}
                >
                  {item.title}
                </h3>

                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. WHY CHOOSE MEDICARE
         ======================================================== */}
      <section className="section-padding" style={{ backgroundColor: "var(--bg-white)" }}>
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
                Why Choose Us
              </span>
              <h2 className="heading-lg" style={{ marginBottom: "20px" }}>
                Patient-Centric Telemedicine Designed For Modern Healthcare
              </h2>
              <p className="text-lead" style={{ marginBottom: "32px" }}>
                We combine top medical expertise with cutting-edge digital infrastructure to deliver compassionate, fast, and secure remote consultations.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                {[
                  "Qualified & Verified Doctors",
                  "Secure Medical Records",
                  "Easy Appointment Booking",
                  "Real-Time Online Chat",
                  "HD Video Consultation",
                  "Digital Prescriptions",
                ].map((feature, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-dark)" }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--primary-light)",
                borderRadius: "var(--radius-xl)",
                padding: "40px",
                border: "1px solid var(--secondary)",
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
                Healthcare Security Guaranteed
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
                All consultation sessions, patient medical histories, uploaded lab reports, and prescriptions are safeguarded with bank-grade encryption standards.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <ShieldCheck size={20} style={{ color: "var(--primary)" }} />
                  <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>HIPAA Compliant & Encrypted</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Clock size={20} style={{ color: "var(--primary)" }} />
                  <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>24/7 Instant Medical Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. DOCTORS SECTION
         ======================================================== */}
      <section className="section-padding" style={{ backgroundColor: "var(--bg-light)" }}>
        <div className="container">
          <div className="section-header">
            <span className="badge">Medical Experts</span>
            <h2 className="heading-lg">Consult Our Top Specialists</h2>
            <p className="text-lead">
              Our verified medical professionals are ready to assist you with personalized medical care.
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
            <Link href="/doctors" className="btn btn-outline btn-lg">
              View All Doctors <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. ABOUT & CTA BANNER
         ======================================================== */}
      <section id="about" className="section-padding" style={{ backgroundColor: "var(--bg-white)" }}>
        <div className="container">
          <div
            style={{
              background: "linear-gradient(135deg, #087F8C 0%, #055C66 100%)",
              borderRadius: "var(--radius-xl)",
              padding: "60px 40px",
              color: "#FFFFFF",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(8, 127, 140, 0.25)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              About MediCare
            </span>

            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "2.5rem",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              Bringing Healthcare Closer to You.
            </h2>

            <p
              style={{
                maxWidth: "680px",
                margin: "0 auto 36px auto",
                fontSize: "1.1rem",
                lineHeight: "1.6",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              MediCare bridges the gap between patients and healthcare providers through a seamless, cloud-based telemedicine solution. Consult top doctors, receive verified digital prescriptions, and manage your health record effortlessly.
            </p>

            <Link
              href="/register"
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: "#FFFFFF",
                color: "var(--primary)",
                fontWeight: "700",
              }}
            >
              Create Your Account <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
