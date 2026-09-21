"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import {
  FileText,
  Upload,
  Plus,
  Calendar,
  Download,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

export default function MedicalRecordsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      fetchReports();
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet("/reports");
      if (res.success) {
        setReports(res.data);
      } else {
        setError(res.message || "Failed to load medical reports.");
      }
    } catch (err) {
      console.error("Error loading medical reports:", err);
      setError("Failed to load medical reports. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !fileUrl) {
      return setError("Title and File Link/URL are required.");
    }

    try {
      setUploading(true);
      const res = await apiPost("/reports", {
        title,
        description,
        fileUrl,
        fileName: `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      });

      if (res.success) {
        setSuccessMsg("Medical report uploaded successfully!");
        setTitle("");
        setDescription("");
        setFileUrl("");
        setUploadModalOpen(false);
        fetchReports();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setError(err.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
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
        {/* Header */}
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
              Medical Records & Lab Reports
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Manage and access your medical history, diagnostic reports, and lab results securely.
            </p>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: "8px" }}
          >
            <Upload size={18} /> Upload Medical Record
          </button>
        </div>

        {/* Alerts */}
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
            <p style={{ fontSize: "1.05rem" }}>Loading your medical records...</p>
          </div>
        ) : reports.length === 0 ? (
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
              No Medical Records Uploaded Yet
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
              Upload your lab test results, X-rays, or medical summary files so your consulting doctors can review them.
            </p>
            <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
              <Upload size={18} /> Upload First Record
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {reports.map((report) => {
              const formattedDate = new Date(report.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={report._id}
                  className="card-base"
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          backgroundColor: "var(--secondary)",
                          color: "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FileText size={24} />
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={14} /> {formattedDate}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px", color: "var(--text-dark)" }}>
                      {report.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.4" }}>
                      {report.description || "Uploaded patient medical report document."}
                    </p>

                    {report.doctorId?.name && (
                      <p style={{ fontSize: "0.825rem", color: "var(--primary)", fontWeight: "600", marginBottom: "16px" }}>
                        Doctor: {report.doctorId.name} ({report.doctorId.specialization})
                      </p>
                    )}
                  </div>

                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ width: "100%", justifyContent: "center", gap: "8px", fontSize: "0.875rem" }}
                  >
                    <ExternalLink size={16} /> View Document
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
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
              maxWidth: "520px",
              padding: "32px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Upload Medical Record</h3>
              <button onClick={() => setUploadModalOpen(false)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Report Title / Document Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blood Test Result Sep 2026"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  File Link / Document URL (PDF/Image)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/reports/blood_test.pdf"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Document Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any relevant notes for your consulting doctor..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {uploading ? "Uploading..." : "Save Medical Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
