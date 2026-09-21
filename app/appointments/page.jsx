"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPut } from "@/lib/api";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Stethoscope,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User as UserIcon,
} from "lucide-react";

export default function AppointmentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      fetchAppointments();
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet("/appointments");
      if (res.success) {
        setAppointments(res.data);
      } else {
        setError(res.message || "Failed to load appointments.");
      }
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError("Failed to load appointments. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        setCancellingId(id);
        const res = await apiPut(`/appointments/${id}`, { status: "cancelled" });
        if (res.success) {
          setSuccessMsg("Appointment cancelled successfully.");
          fetchAppointments();
          setTimeout(() => setSuccessMsg(""), 4000);
        }
      } catch (err) {
        alert(err.message || "Failed to cancel appointment");
      } finally {
        setCancellingId(null);
      }
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === "upcoming") return appt.status === "pending" || appt.status === "confirmed";
    if (filter === "completed") return appt.status === "completed";
    if (filter === "cancelled") return appt.status === "cancelled";
    return true;
  });

  if (authLoading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading session...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "40px 20px" }}>
      <div className="container" style={{ maxWidth: "1100px" }}>
        {/* Header section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 className="heading-lg" style={{ fontSize: "2rem", marginBottom: "6px" }}>
              My Appointments
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              View and manage your telemedicine consultations with specialist doctors.
            </p>
          </div>

          <Link href="/doctors" className="btn btn-primary" style={{ gap: "8px" }}>
            <Plus size={18} /> Book New Appointment
          </Link>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div
            style={{
              backgroundColor: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#047857",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            borderBottom: "1px solid var(--border-color)",
            marginBottom: "28px",
            paddingBottom: "8px",
            overflowX: "auto",
          }}
        >
          {["all", "upcoming", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "10px 20px",
                borderRadius: "var(--radius-md)",
                border: "none",
                backgroundColor: filter === tab ? "var(--primary)" : "transparent",
                color: filter === tab ? "#FFFFFF" : "var(--text-muted)",
                fontWeight: "600",
                fontSize: "0.9rem",
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab === "all" ? `All (${appointments.length})` : tab}
            </button>
          ))}
        </div>

        {/* Appointments Content Area */}
        {loading ? (
          <div
            className="card-base"
            style={{
              padding: "60px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
              color: "var(--text-muted)",
            }}
          >
            <Clock size={36} style={{ marginBottom: "12px", color: "var(--primary)" }} />
            <p style={{ fontSize: "1.05rem" }}>Loading your appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: "60px 20px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Calendar size={48} style={{ color: "var(--text-light)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px" }}>
              No {filter !== "all" ? filter : ""} appointments found
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
              {filter === "all"
                ? "You haven't scheduled any doctor appointments yet."
                : `You currently have no ${filter} appointments on record.`}
            </p>
            <Link href="/doctors" className="btn btn-primary">
              <Stethoscope size={18} /> Find a Doctor
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredAppointments.map((appt) => {
              const doctor = appt.doctorId || {};
              const isPatient = user?.role === "patient";

              return (
                <div
                  key={appt._id}
                  className="card-base"
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                    borderLeft: `5px solid ${
                      appt.status === "confirmed"
                        ? "#10B981"
                        : appt.status === "completed"
                        ? "#3B82F6"
                        : appt.status === "pending"
                        ? "#F59E0B"
                        : "#EF4444"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flex: 1, minWidth: "280px" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        backgroundColor: "var(--secondary)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontWeight: "700",
                        fontSize: "1.2rem",
                      }}
                    >
                      {doctor.name ? doctor.name.charAt(0) : <UserIcon size={26} />}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-dark)" }}>
                          {isPatient ? doctor.name || "Doctor Profile" : appt.patientId?.name || "Patient"}
                        </h3>
                        <span
                          className="badge"
                          style={{
                            backgroundColor:
                              appt.status === "confirmed"
                                ? "#ECFDF5"
                                : appt.status === "completed"
                                ? "#EFF6FF"
                                : appt.status === "pending"
                                ? "#FEF3C7"
                                : "#FEF2F2",
                            color:
                              appt.status === "confirmed"
                                ? "#047857"
                                : appt.status === "completed"
                                ? "#1D4ED8"
                                : appt.status === "pending"
                                ? "#D97706"
                                : "#991B1B",
                            textTransform: "capitalize",
                          }}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <p style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.9rem", marginTop: "2px" }}>
                        {doctor.specialization || "General Specialist"}
                        {doctor.qualification ? ` • ${doctor.qualification}` : ""}
                      </p>

                      <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "0.875rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar size={16} style={{ color: "var(--primary)" }} />
                          {appt.appointmentDate}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={16} style={{ color: "var(--primary)" }} />
                          {appt.appointmentTime}
                        </span>
                        <span style={{ textTransform: "capitalize" }}>
                          <strong>Type:</strong> {appt.consultationType}
                        </span>
                      </div>

                      <p style={{ marginTop: "10px", fontSize: "0.875rem", color: "var(--text-dark)" }}>
                        <strong>Reason:</strong> {appt.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    {(appt.status === "confirmed" || appt.status === "pending") && appt.consultationType === "video" && (
                      <Link href="/consultation" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                        <Video size={16} /> Join Consultation
                      </Link>
                    )}

                    <Link href="/chat" className="btn btn-outline" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                      <MessageSquare size={16} /> Message
                    </Link>

                    {(appt.status === "pending" || appt.status === "confirmed") && (
                      <button
                        onClick={() => handleCancelAppointment(appt._id)}
                        disabled={cancellingId === appt._id}
                        className="btn btn-outline"
                        style={{
                          padding: "8px 16px",
                          fontSize: "0.85rem",
                          color: "#DC2626",
                          borderColor: "#FCA5A5",
                        }}
                      >
                        {cancellingId === appt._id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
