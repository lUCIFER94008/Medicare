"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { apiGet, apiPut, apiPost } from "../../../lib/api";
import {
  Calendar,
  FileText,
  Clock,
  Video,
  MessageSquare,
  LogOut,
  CheckCircle2,
  XCircle,
  Plus,
  Users,
  LayoutDashboard,
  AlertCircle,
} from "lucide-react";

export default function DoctorDashboard() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Prescription Form State
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "Twice daily", duration: "5 days", instructions: "After meals" },
  ]);
  const [instructions, setInstructions] = useState("Take medicines regularly as directed.");
  const [submittingRx, setSubmittingRx] = useState(false);
  const [rxError, setRxError] = useState("");
  const [rxSuccess, setRxSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      router.push("/login");
    } else if (user) {
      fetchDoctorAppointments();
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/appointments/my");
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await apiPut(`/appointments/${id}/status`, { status });
      if (res.success) {
        fetchDoctorAppointments();
      }
    } catch (err) {
      alert(err.message || "Failed to update appointment status");
    }
  };

  const openRxModal = (appt) => {
    setSelectedAppointment(appt);
    setRxModalOpen(true);
    setRxError("");
    setRxSuccess("");
  };

  const handleAddMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "Twice daily", duration: "5 days", instructions: "After meals" },
    ]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setRxError("");

    if (!selectedAppointment) return;

    try {
      setSubmittingRx(true);
      const res = await apiPost("/prescriptions", {
        patientId: selectedAppointment.patientId._id,
        appointmentId: selectedAppointment._id,
        medicines,
        instructions,
      });

      if (res.success) {
        setRxSuccess("Digital prescription generated & sent to patient!");
        // Mark appointment as completed
        await apiPut(`/appointments/${selectedAppointment._id}/status`, { status: "completed" });
        setTimeout(() => {
          setRxModalOpen(false);
          fetchDoctorAppointments();
        }, 1500);
      }
    } catch (err) {
      setRxError(err.message || "Failed to generate prescription");
    } finally {
      setSubmittingRx(false);
    }
  };

  const pendingAppts = appointments.filter((a) => a.status === "pending");
  const completedAppts = appointments.filter((a) => a.status === "completed");

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
            Doctor Portal
          </h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user?.name}</p>
        </div>

        <Link
          href="/doctor/dashboard"
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
          <MessageSquare size={18} /> Patient Chat
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

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: "40px" }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
            Welcome, {user?.name}! 🩺
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
            Manage assigned patient consultations, view symptoms, and issue official digital prescriptions.
          </p>
        </div>

        {/* Dashboard Stat Cards */}
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
                Total Patient Consultations
              </span>
              <Users size={22} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-dark)" }}>
              {appointments.length}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Pending Approval
              </span>
              <Clock size={22} style={{ color: "#D97706" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#D97706" }}>
              {pendingAppts.length}
            </h2>
          </div>

          <div className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Completed Consultations
              </span>
              <CheckCircle2 size={22} style={{ color: "#047857" }} />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#047857" }}>
              {completedAppts.length}
            </h2>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="card-base" style={{ padding: "28px", backgroundColor: "#FFFFFF" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "20px", fontFamily: "'Outfit', sans-serif" }}>
            Patient Appointments List
          </h3>

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading assigned appointments...</p>
          ) : appointments.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>No patient appointments scheduled yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.925rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px" }}>Patient Name</th>
                    <th style={{ padding: "12px" }}>Contact</th>
                    <th style={{ padding: "12px" }}>Date & Time</th>
                    <th style={{ padding: "12px" }}>Symptoms / Reason</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "16px 12px", fontWeight: "700" }}>
                        {appt.patientId?.name || "Patient"}
                      </td>
                      <td style={{ padding: "16px 12px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {appt.patientId?.phone || appt.patientId?.email}
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
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {appt.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(appt._id, "confirmed")}
                              className="btn btn-primary"
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            >
                              Accept
                            </button>
                          )}
                          {appt.status === "confirmed" && (
                            <>
                              <Link href="/consultation" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                                <Video size={14} /> Video Call
                              </Link>
                              <button
                                onClick={() => openRxModal(appt)}
                                className="btn btn-secondary"
                                style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                              >
                                Create Rx
                              </button>
                            </>
                          )}
                          <Link href="/chat" className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            Chat
                          </Link>
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

      {/* Create Digital Prescription Modal */}
      {rxModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
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
              maxWidth: "650px",
              padding: "32px",
              backgroundColor: "#FFFFFF",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700" }}>
                Create Digital Prescription for {selectedAppointment?.patientId?.name}
              </h3>
              <button onClick={() => setRxModalOpen(false)} style={{ fontSize: "1.25rem" }}>✕</button>
            </div>

            {rxSuccess && (
              <div style={{ backgroundColor: "#ECFDF5", color: "#047857", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                {rxSuccess}
              </div>
            )}
            {rxError && (
              <div style={{ backgroundColor: "#FEF2F2", color: "#991B1B", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                {rxError}
              </div>
            )}

            <form onSubmit={handleCreatePrescription} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "700" }}>Prescribed Medicines List:</label>

              {medicines.map((med, i) => (
                <div key={i} style={{ padding: "12px", backgroundColor: "var(--bg-light)", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      required
                      value={med.name}
                      onChange={(e) => handleMedicineChange(i, "name", e.target.value)}
                      style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      required
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)}
                      style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Frequency (e.g. Twice daily)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(i, "frequency", e.target.value)}
                      style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(i, "duration", e.target.value)}
                      style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                    />
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMedicineRow(i)} style={{ color: "#DC2626", fontWeight: "600", fontSize: "0.85rem" }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="button" onClick={handleAddMedicineRow} className="btn btn-outline" style={{ padding: "8px", fontSize: "0.85rem", alignSelf: "flex-start" }}>
                + Add Another Medicine
              </button>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>General Doctor Advice / Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setRxModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingRx} className="btn btn-primary" style={{ flex: 1 }}>
                  {submittingRx ? "Issuing Rx..." : "Issue Digital Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
