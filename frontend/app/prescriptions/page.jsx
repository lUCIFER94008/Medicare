"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "../../lib/api";
import { FileText, Printer, HeartPulse, Stethoscope, Eye, Calendar, User } from "lucide-react";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    if (user) fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/prescriptions/my");
      if (res.success) setPrescriptions(res.data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "100vh", padding: "48px 0" }}>
      <div className="container">
        <div style={{ marginBottom: "32px" }}>
          <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
            Digital Prescriptions History
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            View official digital prescriptions issued by your consulting doctors with printable formats.
          </p>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <div className="card-base" style={{ padding: "48px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
            <FileText size={48} style={{ color: "var(--text-light)", marginBottom: "16px" }} />
            <h3>No Prescriptions Available</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              Digital prescriptions will appear here once your consulting doctor generates one.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {prescriptions.map((rx) => (
              <div key={rx._id} className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                      {user?.role === "patient" ? rx.doctorId?.name : rx.patientId?.name}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600" }}>
                      {rx.doctorId?.specialization || "General Medicine"}
                    </p>
                  </div>
                  <span className="badge" style={{ backgroundColor: "#ECFDF5", color: "#047857" }}>
                    Verified Rx
                  </span>
                </div>

                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "20px" }}>
                  <p>📅 Prescribed: {new Date(rx.createdAt).toLocaleDateString()}</p>
                  <p style={{ marginTop: "4px" }}>💊 Medicines Count: {rx.medicines?.length || 0}</p>
                </div>

                <button
                  onClick={() => setSelectedRx(rx)}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  <Eye size={16} /> View & Print Prescription
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Print Modal */}
      {selectedRx && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="card-base printable-area"
            style={{
              width: "100%",
              maxWidth: "680px",
              padding: "40px",
              backgroundColor: "#FFFFFF",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Printable Rx Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--primary)", paddingBottom: "20px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <HeartPulse size={32} style={{ color: "var(--primary)" }} />
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary)", fontFamily: "'Outfit', sans-serif" }}>
                    MediCare Telemedicine
                  </h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Official Digital Health Prescription</p>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <p>Date: {new Date(selectedRx.createdAt).toLocaleDateString()}</p>
                <p>Rx ID: #{selectedRx._id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            {/* Doctor & Patient Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-light)", borderRadius: "var(--radius-md)" }}>
              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: "700" }}>Doctor Details:</h4>
                <p style={{ fontWeight: "700", marginTop: "4px" }}>{selectedRx.doctorId?.name}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{selectedRx.doctorId?.specialization}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedRx.doctorId?.qualification}</p>
              </div>
              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: "700" }}>Patient Details:</h4>
                <p style={{ fontWeight: "700", marginTop: "4px" }}>{selectedRx.patientId?.name}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Email: {selectedRx.patientId?.email}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Phone: {selectedRx.patientId?.phone}</p>
              </div>
            </div>

            {/* Medicines Table */}
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", fontFamily: "'Outfit', sans-serif" }}>
              💊 Prescribed Medications (Rx)
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--secondary)", color: "var(--primary)", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Medicine Name</th>
                  <th style={{ padding: "10px" }}>Dosage</th>
                  <th style={{ padding: "10px" }}>Frequency</th>
                  <th style={{ padding: "10px" }}>Duration</th>
                  <th style={{ padding: "10px" }}>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {selectedRx.medicines?.map((med, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "700" }}>{med.name}</td>
                    <td style={{ padding: "12px 10px" }}>{med.dosage}</td>
                    <td style={{ padding: "12px 10px" }}>{med.frequency}</td>
                    <td style={{ padding: "12px 10px" }}>{med.duration}</td>
                    <td style={{ padding: "12px 10px", color: "var(--text-muted)" }}>{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Additional Advice */}
            <div style={{ marginBottom: "32px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px" }}>Doctor's Advice & Notes:</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-dark)", lineHeight: "1.6" }}>{selectedRx.instructions}</p>
            </div>

            {/* Footer Signature */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                This is an authenticated digital prescription issued via MediCare Telemedicine.
              </span>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: "700", color: "var(--primary)" }}>
                  {selectedRx.doctorId?.name}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Digitally Signed</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print" style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => setSelectedRx(null)} className="btn btn-outline" style={{ flex: 1 }}>
                Close
              </button>
              <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1 }}>
                <Printer size={18} /> Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
