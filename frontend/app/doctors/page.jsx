"use client";

import { useState, useEffect } from "react";
import DoctorCard from "../../components/DoctorCard";
import { apiGet } from "../../lib/api";
import { Search, Filter, Stethoscope, RefreshCw } from "lucide-react";

export default function DoctorsDirectoryPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  const specializationsList = [
    "All",
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Orthopedic",
    "Gynecologist",
    "Psychiatrist",
  ];

  useEffect(() => {
    fetchDoctors();
  }, [specialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let query = "";
      if (specialization !== "All") {
        query += `specialization=${encodeURIComponent(specialization)}`;
      }
      const res = await apiGet(`/doctors${query ? `?${query}` : ""}`);
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const searchLower = search.toLowerCase();
    return (
      doc.name.toLowerCase().includes(searchLower) ||
      doc.specialization.toLowerCase().includes(searchLower) ||
      doc.qualification.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "100vh", padding: "48px 0" }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ textBaseline: "center", marginBottom: "40px" }}>
          <span className="badge" style={{ marginBottom: "12px" }}>
            <Stethoscope size={16} /> Verified Specialists
          </span>
          <h1 className="heading-lg" style={{ marginBottom: "12px" }}>
            Find & Book Qualified Doctors
          </h1>
          <p className="text-lead" style={{ maxWidth: "600px" }}>
            Browse through our network of verified medical professionals for instant video or chat consultations.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div
          className="card-base"
          style={{
            padding: "24px",
            marginBottom: "36px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
              <Search
                size={20}
                style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-light)" }}
              />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or qualification..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 44px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Specialization Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>
              Specialization:
            </span>
            {specializationsList.map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecialization(spec)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  transition: "var(--transition)",
                  backgroundColor: specialization === spec ? "var(--primary)" : "var(--bg-light)",
                  color: specialization === spec ? "#FFFFFF" : "var(--text-dark)",
                  border: "1px solid",
                  borderColor: specialization === spec ? "var(--primary)" : "var(--border-color)",
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Cards Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <RefreshCw size={32} className="spin" style={{ marginBottom: "16px", color: "var(--primary)" }} />
            <p style={{ fontSize: "1rem" }}>Loading verified doctors from database...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Stethoscope size={48} style={{ color: "var(--text-light)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px" }}>
              No Doctors Found
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              No verified doctors match your search filters. Try clearing your search query.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "28px",
            }}
          >
            {filteredDoctors.map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={{
                  id: doc._id,
                  name: doc.name,
                  specialization: doc.specialization,
                  qualification: doc.qualification,
                  rating: 4.9,
                  reviewsCount: 150,
                  experience: doc.experience,
                  consultationFee: `$${doc.consultationFee}`,
                  availability: doc.availability?.[0] || "Available Today",
                  isVerified: doc.isVerified,
                  avatarBg: "linear-gradient(135deg, #087F8C 0%, #055C66 100%)",
                  initials: doc.name.replace("Dr. ", "").split(" ").map(n => n[0]).join(""),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
