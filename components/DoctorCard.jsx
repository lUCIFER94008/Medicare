import Link from "next/link";
import { Star, CheckCircle, Calendar, Award } from "lucide-react";

export default function DoctorCard({ doctor }) {
  const {
    id = "1",
    name = "Dr. Sarah Johnson",
    specialization = "General Physician",
    qualification = "MBBS, MD (Internal Medicine)",
    rating = 4.9,
    reviewsCount = 124,
    experience = "10+ Yrs Exp.",
    consultationFee = "$50",
    availability = "Available Today",
    isVerified = true,
    avatarBg = "linear-gradient(135deg, #087F8C 0%, #065B64 100%)",
    initials = "SJ",
  } = doctor || {};

  return (
    <div
      className="card-base"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Top Avatar & Name */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "18px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-md)",
            background: avatarBg,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "1.25rem",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(8, 127, 140, 0.2)",
          }}
        >
          {initials}
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h4
              style={{
                fontSize: "1.125rem",
                fontWeight: "700",
                fontFamily: "'Outfit', sans-serif",
                color: "var(--text-dark)",
              }}
            >
              {name}
            </h4>
            {isVerified && (
              <CheckCircle size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
            )}
          </div>
          <p
            style={{
              color: "var(--primary)",
              fontWeight: "600",
              fontSize: "0.875rem",
              marginTop: "2px",
            }}
          >
            {specialization}
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              marginTop: "2px",
            }}
          >
            {qualification}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          padding: "12px",
          backgroundColor: "var(--bg-light)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "20px",
          fontSize: "0.825rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dark)" }}>
          <Award size={15} style={{ color: "var(--primary)" }} />
          <span>{experience}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dark)" }}>
          <Star size={15} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
          <span>{rating} ({reviewsCount})</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          fontSize: "0.875rem",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>Consultation Fee:</span>
        <span style={{ fontWeight: "700", color: "var(--text-dark)", fontSize: "1rem" }}>
          {consultationFee}
        </span>
      </div>

      {/* Availability Pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "#ECFDF5",
          color: "#047857",
          fontSize: "0.8rem",
          fontWeight: "600",
          marginBottom: "20px",
          alignSelf: "flex-start",
        }}
      >
        <Calendar size={14} />
        {availability}
      </div>

      {/* CTA Buttons */}
      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
        <Link
          href={`/doctors/${id}`}
          className="btn btn-outline"
          style={{ flex: 1, padding: "10px 14px", fontSize: "0.85rem" }}
        >
          View Profile
        </Link>
        <Link
          href={`/doctors/${id}`}
          className="btn btn-primary"
          style={{ flex: 1, padding: "10px 14px", fontSize: "0.85rem" }}
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
