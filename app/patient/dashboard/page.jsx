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
  CheckCircle2,
  Pill,
} from "lucide-react";

export default function PatientDashboard() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "patient")) {
      router.push("/login");
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/patient/dashboard");
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
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

  const stats = dashboardData?.statistics || {
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalAppointments: 0,
    prescriptions: 0,
    medicalReports: 0,
  };

  const upcomingAppointments = dashboardData?.upcomingAppointments || [];
  const recentPrescriptions = dashboardData?.recentPrescriptions || [];
  const recentReports = dashboardData?.recentReports || [];

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
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
          <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-dark)", marginTop: "2px" }}>
            {user?.name}
          </p>
          <p style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>{user?.email}</p>
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
          <Calendar size={18} /> Appointments ({stats.totalAppointments})
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
          <FileText size={18} /> Prescriptions ({stats.prescriptions})
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
          <FileText size={18} /> Medical Reports ({stats.medicalReports})
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
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Dashboard Content */}
      <main style={{ flexGrow: 1, padding: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
              Here is your active healthcare dashboard and MongoDB appointment summary.
            </p>
          </div>
          <Link href="/doctors" className="btn btn-primary">
            <Plus size={18} /> Book Consultation
          </Link>
        </div>

        {/* Real Statistics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Upcoming Consultations
              </span>
              <Calendar size={20} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {loading ? "..." : stats.upcomingAppointments}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Completed Consultations
              </span>
              <CheckCircle2 size={20} style={{ color: "#047857" }} />
            </div>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#047857" }}>
              {loading ? "..." : stats.completedAppointments}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Digital Prescriptions
              </span>
              <Pill size={20} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {loading ? "..." : stats.prescriptions}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Medical Reports
              </span>
              <FileText size={20} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {loading ? "..." : stats.medicalReports}
            </h2>
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="card-base" style={{ padding: "28px", backgroundColor: "#FFFFFF", marginBottom: "36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>
              Upcoming Doctor Appointments
            </h3>
            <Link href="/appointments" style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.9rem" }}>
              View All Appointments →
            </Link>
          </div>

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
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
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
                          {appt.consultationType === "video" && (
                            <Link href="/consultation" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                              <Video size={14} /> Join Call
                            </Link>
                          )}
                          <button
                            onClick={() => handleCancelAppointment(appt._id)}
                            style={{ padding: "6px 10px", color: "#DC2626", fontSize: "0.8rem", fontWeight: "600", border: "none", background: "none", cursor: "pointer" }}
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

        {/* Recent Prescriptions Section */}
        {recentPrescriptions.length > 0 && (
          <div className="card-base" style={{ padding: "28px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>
                Recent Issued Prescriptions
              </h3>
              <Link href="/prescriptions" style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.9rem" }}>
                View All Prescriptions →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentPrescriptions.map((rx) => (
                <div
                  key={rx._id}
                  style={{
                    padding: "16px",
                    backgroundColor: "var(--bg-light)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>
                      Dr. {rx.doctorId?.name || "Consultant"} ({rx.doctorId?.specialization || "Doctor"})
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Medicines: {rx.medicines?.map((m) => m.name).join(", ")}
                    </p>
                  </div>
                  <Link href="/prescriptions" className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                    View Rx Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
