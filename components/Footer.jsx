import Link from "next/link";
import { HeartPulse, Mail, Phone, MapPin, Shield, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--text-dark)",
        color: "#FFFFFF",
        paddingTop: "72px",
        paddingBottom: "36px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            marginBottom: "60px",
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: "320px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "1.5rem",
                fontWeight: "800",
                fontFamily: "'Outfit', sans-serif",
                color: "#FFFFFF",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  backgroundColor: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <HeartPulse size={22} />
              </div>
              MediCare
            </div>
            <p
              style={{
                color: "var(--text-light)",
                fontSize: "0.925rem",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              Empowering healthcare access with trusted online consultations, digital prescriptions, and instant doctor booking anytime, anywhere.
            </p>
            <div style={{ display: "flex", gap: "12px", color: "var(--secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                <Shield size={16} /> 100% Encrypted & Safe
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#FFFFFF",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              <li>
                <Link href="/" style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/doctors" style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/#services" style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/#about" style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>
                  About MediCare
                </Link>
              </li>
              <li>
                <Link href="/register" style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>
                  Doctor Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#FFFFFF",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Services
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              <li style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>Online Doctor Consultation</li>
              <li style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>Instant Appointment Booking</li>
              <li style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>HD Video Consultation</li>
              <li style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>Digital Prescriptions</li>
              <li style={{ color: "var(--text-light)", fontSize: "0.925rem" }}>Secure Medical Records</li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#FFFFFF",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Contact Us
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "14px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-light)", fontSize: "0.9rem" }}>
                <Phone size={18} style={{ color: "var(--primary)" }} /> +1 (800) 555-MEDICARE
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-light)", fontSize: "0.9rem" }}>
                <Mail size={18} style={{ color: "var(--primary)" }} /> support@medicare-telemed.com
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-light)", fontSize: "0.9rem" }}>
                <MapPin size={18} style={{ color: "var(--primary)" }} /> 750 Health Plaza, Suite 400
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-light)", fontSize: "0.9rem" }}>
                <Clock size={18} style={{ color: "var(--primary)" }} /> 24/7 Emergency & Care Support
              </li>
            </ul>
          </div>
        </div>

        <hr style={{ borderColor: "#2A3447", margin: "30px 0" }} />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            fontSize: "0.875rem",
            color: "var(--text-light)",
          }}
        >
          <p>© {new Date().getFullYear()} MediCare Telemedicine Platform. All rights reserved.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="#" style={{ color: "var(--text-light)" }}>
              Privacy Policy
            </Link>
            <Link href="#" style={{ color: "var(--text-light)" }}>
              Terms & Conditions
            </Link>
            <Link href="#" style={{ color: "var(--text-light)" }}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
