"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { apiGet, apiPut } from "../../../lib/api";
import {
  Users,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Shield,
  LogOut,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login");
    } else if (user) {
      fetchAdminData();
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, doctorsRes] = await Promise.all([
        apiGet("/admin/dashboard"),
        apiGet("/admin/doctors"),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (doctorsRes.success) setDoctors(doctorsRes.data);
    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (id) => {
    try {
      const res = await apiPut(`/admin/doctors/${id}/verify`);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || "Failed to verify doctor");
    }
  };

  const handleRejectDoctor = async (id) => {
    try {
      const res = await apiPut(`/admin/doctors/${id}/reject`);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || "Failed to unverify doctor");
    }
  };

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
            Admin Control Center
          </h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user?.email}</p>
        </div>

        <Link
          href="/admin/dashboard"
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
          <LayoutDashboard size={18} /> Dashboard Overview
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
          <Stethoscope size={18} /> Doctor Verification
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
          <Calendar size={18} /> All Appointments
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
          <LogOut size={18} /> Logout Admin
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: "40px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
            MediCare Platform Management 🛡️
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
            Monitor system metrics, review doctor applications, and enforce doctor verification credentials.
          </p>
        </div>

        {/* System Metrics Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Total Patients
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", marginTop: "8px", color: "var(--text-dark)" }}>
              {stats?.totalPatients ?? 0}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Total Doctors
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", marginTop: "8px", color: "var(--primary)" }}>
              {stats?.totalDoctors ?? 0}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Verified Doctors
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", marginTop: "8px", color: "#047857" }}>
              {stats?.verifiedDoctors ?? 0}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Pending Verification
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", marginTop: "8px", color: "#D97706" }}>
              {stats?.pendingDoctors ?? 0}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Total Appointments
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: "800", marginTop: "8px", color: "var(--text-dark)" }}>
              {stats?.totalAppointments ?? 0}
            </h2>
          </div>
        </div>

        {/* Doctor Verification Management Table */}
        <div className="card-base" style={{ padding: "28px", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>
              Doctor Credential Verification
            </h3>
            <span className="badge" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
              <AlertTriangle size={14} /> Only Verified Doctors appear in public search
            </span>
          </div>

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading doctor registrations...</p>
          ) : doctors.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>No doctor accounts registered.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.925rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px" }}>Doctor Name</th>
                    <th style={{ padding: "12px" }}>Specialization</th>
                    <th style={{ padding: "12px" }}>Qualification & Experience</th>
                    <th style={{ padding: "12px" }}>Fee</th>
                    <th style={{ padding: "12px" }}>Verification Status</th>
                    <th style={{ padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "16px 12px", fontWeight: "700" }}>
                        {doc.name}
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "400" }}>
                          {doc.email}
                        </div>
                      </td>
                      <td style={{ padding: "16px 12px", color: "var(--primary)", fontWeight: "600" }}>
                        {doc.specialization}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        {doc.qualification} ({doc.experience})
                      </td>
                      <td style={{ padding: "16px 12px", fontWeight: "700" }}>
                        ${doc.consultationFee}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: doc.isVerified ? "#ECFDF5" : "#FEF3C7",
                            color: doc.isVerified ? "#047857" : "#D97706",
                          }}
                        >
                          {doc.isVerified ? "Verified" : "Pending Verification"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        {doc.isVerified ? (
                          <button
                            onClick={() => handleRejectDoctor(doc._id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#FEF2F2",
                              color: "#DC2626",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                            }}
                          >
                            Revoke Verification
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyDoctor(doc._id)}
                            className="btn btn-primary"
                            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                          >
                            <CheckCircle2 size={14} /> Verify Doctor
                          </button>
                        )}
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
