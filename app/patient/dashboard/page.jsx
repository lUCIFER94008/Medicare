"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPut } from "@/lib/api";
import {
  Calendar,
  FileText,
  Clock,
  Video,
  MessageSquare,
  LogOut,
  Stethoscope,
  Plus,
  LayoutDashboard,
} from "lucide-react";

export default function PatientDashboard() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptRes, rxRes, reportRes] = await Promise.all([
        apiGet("/appointments"),
        apiGet("/prescriptions"),
        apiGet("/reports"),
      ]);

      if (apptRes.success) setAppointments(apptRes.data);
      if (rxRes.success) setPrescriptions(rxRes.data);
      if (reportRes.success) setReports(reportRes.data);
    } catch (err) {
      console.error("Error loading patient dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const res = await apiPut(`/appointments/${id}`, { status: "cancelled" });
        if (res.success) {
          fetchDashboardData();
        }
      } catch (err) {
        alert(err.message || "Failed to cancel appointment");
      }
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending"
  );

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: "260px",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid var(--border-color)",
          padding: "32px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: "24px", paddingLeft: "12px" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)" }}>
            Patient Portal
          </h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user?.email}</p>
        </div>

        <Link
          href="/patient/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--secondary)",
            color: "var(--primary)",
            fontWeight: "600",
            fontSize: "0.9rem",
          }}
        >
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link
          href="/doctors"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          <Stethoscope size={18} /> Find Doctors
        </Link>
        <Link
          href="/appointments"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          <Calendar size={18} /> Appointments
        </Link>
        <Link
          href="/prescriptions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          <FileText size={18} /> Prescriptions
        </Link>
        <Link
          href="/medical-records"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          <FileText size={18} /> Medical Reports
        </Link>
        <Link
          href="/chat"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          <MessageSquare size={18} /> Messages
        </Link>

        <button
          onClick={logout}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "#DC2626",
            fontWeight: "600",
            fontSize: "0.9rem",
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main style={{ flexGrow: 1, padding: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
              Here is your healthcare consultation overview and upcoming medical schedules.
            </p>
          </div>
          <Link href="/doctors" className="btn btn-primary">
            <Plus size={18} /> Book Consultation
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            marginBottom: "36px",
          }}
        >
          <div className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Upcoming Consultations
              </span>
              <Calendar size={22} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {upcomingAppointments.length}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Total Appointments
              </span>
              <Clock size={22} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {appointments.length}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Digital Prescriptions
              </span>
              <FileText size={22} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {prescriptions.length}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Uploaded Reports
              </span>
              <FileText size={22} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {reports.length}
            </h2>
          </div>
        </div>

        <div className="card-base" style={{ padding: "28px", backgroundColor: "#FFFFFF", marginBottom: "36px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "20px", fontFamily: "'Outfit', sans-serif" }}>
            Upcoming Appointments
          </h3>

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading appointments...</p>
          ) : upcomingAppointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <p>No upcoming appointments found.</p>
              <Link href="/doctors" className="btn btn-outline" style={{ marginTop: "12px" }}>
                Find a Doctor to Book
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.925rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px" }}>Doctor</th>
                    <th style={{ padding: "12px" }}>Specialization</th>
                    <th style={{ padding: "12px" }}>Date & Time</th>
                    <th style={{ padding: "12px" }}>Reason</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((appt) => (
                    <tr key={appt._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "16px 12px", fontWeight: "700" }}>
                        {appt.doctorId?.name || "Doctor"}
                      </td>
                      <td style={{ padding: "16px 12px", color: "var(--primary)" }}>
                        {appt.doctorId?.specialization || "General"}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        {appt.appointmentDate} at {appt.appointmentTime}
                      </td>
                      <td style={{ padding: "16px 12px", color: "var(--text-muted)" }}>
                        {appt.reason}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: appt.status === "confirmed" ? "#ECFDF5" : "#FEF3C7",
                            color: appt.status === "confirmed" ? "#047857" : "#D97706",
                            textTransform: "capitalize",
                          }}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link href="/consultation" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            <Video size={14} /> Join Call
                          </Link>
                          <Link href="/chat" className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            <MessageSquare size={14} /> Chat
                          </Link>
                          <button
                            onClick={() => handleCancelAppointment(appt._id)}
                            style={{ padding: "6px 10px", color: "#DC2626", fontSize: "0.8rem", fontWeight: "600" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
