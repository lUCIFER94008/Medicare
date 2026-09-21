"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";
import {
  FileText,
  Printer,
  Calendar,
  User as UserIcon,
  Stethoscope,
  Pill,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function PrescriptionsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      fetchPrescriptions();
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet("/prescriptions");
      if (res.success) {
        setPrescriptions(res.data);
      } else {
        setError(res.message || "Failed to load prescriptions.");
      }
    } catch (err) {
      console.error("Error loading prescriptions:", err);
      setError("Failed to load prescriptions. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading session...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "40px 20px" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Page Header */}
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
              My Digital Prescriptions
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Official medical prescriptions issued by your consulting doctors on MediCare.
            </p>
          </div>

          {prescriptions.length > 0 && (
            <button onClick={handlePrint} className="btn btn-outline" style={{ gap: "8px" }}>
              <Printer size={18} /> Print Prescriptions
            </button>
          )}
        </div>

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

        {/* Content Section */}
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
            <p style={{ fontSize: "1.05rem" }}>Loading your digital prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: "60px 20px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <FileText size={48} style={{ color: "var(--text-light)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px" }}>
              No Digital Prescriptions Available
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
              You do not have any issued medical prescriptions at this time. Once a doctor prescribes medicines, they will appear here.
            </p>
            <Link href="/appointments" className="btn btn-primary">
              View Appointments
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {prescriptions.map((rx) => {
              const doctor = rx.doctorId || {};
              const formattedDate = new Date(rx.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <div
                  key={rx._id}
                  className="card-base prescription-card"
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "32px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {/* Prescription Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "16px",
                      paddingBottom: "20px",
                      borderBottom: "2px solid var(--primary-light)",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <Stethoscope size={24} style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-dark)" }}>
                          {doctor.name || "Consulting Doctor"}
                        </h3>
                      </div>
                      <p style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.925rem" }}>
                        {doctor.specialization || "Medical Specialist"}
                        {doctor.qualification ? ` • ${doctor.qualification}` : ""}
                      </p>
                      {doctor.phone && (
                        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          Contact: {doctor.phone} {doctor.email ? `\| ${doctor.email}` : ""}
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "var(--secondary)",
                          color: "var(--primary)",
                          padding: "6px 14px",
                          borderRadius: "var(--radius-full)",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          marginBottom: "8px",
                        }}
                      >
                        <Calendar size={14} /> Issued: {formattedDate}
                      </span>
                      <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
                        Rx Ref ID: {rx._id.substring(0, 10).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Patient Info Bar */}
                  <div
                    style={{
                      backgroundColor: "var(--bg-light)",
                      padding: "12px 18px",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "24px",
                      display: "flex",
                      gap: "24px",
                      fontSize: "0.9rem",
                      color: "var(--text-dark)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      <strong>Patient Name:</strong> {rx.patientId?.name || user?.name}
                    </span>
                    {rx.patientId?.email && (
                      <span>
                        <strong>Email:</strong> {rx.patientId?.email}
                      </span>
                    )}
                  </div>

                  {/* Prescribed Medicines Section */}
                  <div style={{ marginBottom: "24px" }}>
                    <h4
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: "700",
                        marginBottom: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "var(--primary)",
                      }}
                    >
                      <Pill size={20} /> Prescribed Medication List
                    </h4>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                        <thead>
                          <tr
                            style={{
                              backgroundColor: "var(--primary-light)",
                              color: "var(--primary)",
                              fontWeight: "700",
                            }}
                          >
                            <th style={{ padding: "12px 14px" }}>Medicine Name</th>
                            <th style={{ padding: "12px 14px" }}>Dosage</th>
                            <th style={{ padding: "12px 14px" }}>Frequency</th>
                            <th style={{ padding: "12px 14px" }}>Duration</th>
                            <th style={{ padding: "12px 14px" }}>Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rx.medicines?.map((med, idx) => (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: "1px solid var(--border-color)",
                                backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "var(--bg-light)",
                              }}
                            >
                              <td style={{ padding: "14px", fontWeight: "700", color: "var(--text-dark)" }}>
                                {med.name}
                              </td>
                              <td style={{ padding: "14px", fontWeight: "600", color: "var(--primary)" }}>
                                {med.dosage}
                              </td>
                              <td style={{ padding: "14px" }}>{med.frequency}</td>
                              <td style={{ padding: "14px" }}>{med.duration}</td>
                              <td style={{ padding: "14px", color: "var(--text-muted)" }}>
                                {med.instructions || "As directed"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Instructions & Doctor Advice */}
                  {rx.instructions && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#FFFBEB",
                        border: "1px solid #FCD34D",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.9rem",
                        color: "#92400E",
                      }}
                    >
                      <strong>Doctor's Advice & Care Instructions:</strong>
                      <p style={{ marginTop: "4px", lineHeight: "1.5" }}>{rx.instructions}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          header, footer, nav, button {
            display: none !important;
          }
          body {
            background-color: #FFFFFF !important;
          }
          .prescription-card {
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
