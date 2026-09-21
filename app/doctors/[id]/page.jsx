"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2,
  Star,
  Award,
  Clock,
  Video,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00 AM");
  const [reason, setReason] = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchDoctor();
    }
  }, [params.id]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/doctors/${params.id}`);
      if (res.success) {
        setDoctor(res.data);
      }
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      router.push(`/login?redirect=/doctors/${params.id}`);
      return;
    }

    if (!appointmentDate || !reason.trim()) {
      return setError("Please fill in date and consultation reason.");
    }

    try {
      setSubmitting(true);
      const res = await apiPost("/appointments", {
        doctorId: doctor._id,
        appointmentDate,
        appointmentTime,
        reason,
        consultationType,
      });

      if (res.success) {
        setSuccessMessage("Appointment booked successfully!");
        setTimeout(() => {
          setBookingModalOpen(false);
          router.push("/patient/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--text-muted)" }}>
        Loading doctor profile...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Doctor Profile Not Found</h2>
        <button onClick={() => router.push("/doctors")} className="btn btn-primary" style={{ marginTop: "20px" }}>
          Back to Doctor Directory
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "100vh", padding: "48px 0" }}>
      <div className="container">
        <button
          onClick={() => router.push("/doctors")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--primary)",
            fontWeight: "600",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={18} /> Back to Doctor Directory
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="card-base" style={{ padding: "32px", backgroundColor: "#FFFFFF" }}>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, #087F8C 0%, #055C66 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "2rem",
                    flexShrink: 0,
                  }}
                >
                  {doctor.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("")}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
                      {doctor.name}
                    </h1>
                    {doctor.isVerified && (
                      <span className="badge" style={{ backgroundColor: "#ECFDF5", color: "#047857" }}>
                        <CheckCircle2 size={16} /> Verified Doctor
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--primary)", fontWeight: "700", fontSize: "1.05rem", marginTop: "4px" }}>
                    {doctor.specialization}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", marginTop: "4px" }}>
                    {doctor.qualification}
                  </p>

                  <div style={{ display: "flex", gap: "20px", marginTop: "16px", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Award size={18} style={{ color: "var(--primary)" }} />
                      <span style={{ fontWeight: "600" }}>{doctor.experience}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Star size={18} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                      <span style={{ fontWeight: "600" }}>4.9 (124 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-base" style={{ padding: "32px", backgroundColor: "#FFFFFF" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px", fontFamily: "'Outfit', sans-serif" }}>
                About Doctor
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.7", fontSize: "0.975rem" }}>
                {doctor.about || "Dedicated healthcare professional providing compassionate patient care."}
              </p>
            </div>

            <div className="card-base" style={{ padding: "32px", backgroundColor: "#FFFFFF" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px", fontFamily: "'Outfit', sans-serif" }}>
                Consultation Availability
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {doctor.availability?.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-light)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.925rem",
                      fontWeight: "600",
                    }}
                  >
                    <Clock size={18} style={{ color: "var(--primary)" }} />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div
              className="card-base"
              style={{
                padding: "28px",
                backgroundColor: "#FFFFFF",
                position: "sticky",
                top: "100px",
              }}
            >
              <div style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Consultation Fee</span>
                <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--primary)", fontFamily: "'Outfit', sans-serif" }}>
                  ${doctor.consultationFee} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "400" }}>/ session</span>
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--text-dark)" }}>
                  <Video size={18} style={{ color: "var(--primary)" }} /> HD Tele-Video Consultation
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--text-dark)" }}>
                  <MessageSquare size={18} style={{ color: "var(--primary)" }} /> Direct Patient Chat
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--text-dark)" }}>
                  <ShieldCheck size={18} style={{ color: "var(--primary)" }} /> Official Digital Prescription
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn btn-primary btn-lg"
                style={{ width: "100%" }}
              >
                Book Consultation Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {bookingModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="card-base"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "32px",
              backgroundColor: "#FFFFFF",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700" }}>Book Appointment</h3>
              <button onClick={() => setBookingModalOpen(false)} style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>
                ✕
              </button>
            </div>

            {successMessage && (
              <div
                style={{
                  backgroundColor: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#047857",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <CheckCircle2 size={18} /> {successMessage}
              </div>
            )}

            {error && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#991B1B",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleBookAppointment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Selected Doctor
                </label>
                <input
                  type="text"
                  disabled
                  value={`${doctor.name} (${doctor.specialization})`}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-light)",
                    border: "1px solid var(--border-color)",
                    fontWeight: "600",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Time Slot *
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Consultation Type
                </label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <option value="video">HD Video Consultation</option>
                  <option value="chat">Real-time Chat Consultation</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Consultation Reason / Symptoms *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your health symptoms or medical advice needed..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {submitting ? "Booking..." : `Confirm & Pay ($${doctor.consultationFee})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
