"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPut } from "../../lib/api";
import { Calendar, Clock, Video, MessageSquare, Plus, ArrowLeft } from "lucide-react";

export default function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/appointments/my");
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (confirm("Cancel this appointment?")) {
      try {
        const res = await apiPut(`/appointments/${id}/cancel`);
        if (res.success) fetchAppointments();
      } catch (err) {
        alert(err.message || "Failed to cancel");
      }
    }
  };

  const filteredAppts = appointments.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "100vh", padding: "48px 0" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
              My Appointments History
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Manage and review your scheduled telemedicine consultations.
            </p>
          </div>
          {user?.role === "patient" && (
            <Link href="/doctors" className="btn btn-primary">
              <Plus size={18} /> New Appointment
            </Link>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                fontWeight: "600",
                textTransform: "capitalize",
                backgroundColor: filter === status ? "var(--primary)" : "#FFFFFF",
                color: filter === status ? "#FFFFFF" : "var(--text-dark)",
                border: "1px solid",
                borderColor: filter === status ? "var(--primary)" : "var(--border-color)",
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Appointments Cards */}
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading appointments...</p>
        ) : filteredAppts.length === 0 ? (
          <div className="card-base" style={{ padding: "48px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
            <Calendar size={48} style={{ color: "var(--text-light)", marginBottom: "16px" }} />
            <h3>No Appointments Found</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              No consultation records match the selected status filter.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredAppts.map((appt) => (
              <div
                key={appt._id}
                className="card-base"
                style={{
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>
                      {user?.role === "patient" ? appt.doctorId?.name : appt.patientId?.name}
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
                  <p style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.9rem" }}>
                    {appt.doctorId?.specialization || "General Medicine"}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
                    📅 {appt.appointmentDate} at ⏰ {appt.appointmentTime}
                  </p>
                  <p style={{ color: "var(--text-dark)", fontSize: "0.9rem", marginTop: "8px" }}>
                    <strong>Reason:</strong> {appt.reason}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {(appt.status === "confirmed" || appt.status === "pending") && (
                    <>
                      <Link href="/consultation" className="btn btn-primary">
                        <Video size={16} /> Join Call
                      </Link>
                      <Link href="/chat" className="btn btn-outline">
                        <MessageSquare size={16} /> Chat
                      </Link>
                      <button
                        onClick={() => handleCancel(appt._id)}
                        className="btn btn-outline"
                        style={{ color: "#DC2626", borderColor: "#DC2626" }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
